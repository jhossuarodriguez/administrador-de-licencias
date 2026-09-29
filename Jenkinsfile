pipeline {
    agent none

    environment {
        CI = 'true'
        // Registro de imágenes: definir HARBOR_REGISTRY en Jenkins (global o del job)
        IMG = "${env.HARBOR_REGISTRY ?: 'harbor.example.com'}/licencias/license-administrator"
        // Base de datos ficticia para prisma generate / build (no se abre conexión real)
        DATABASE_URL = 'postgresql://user:pass@localhost:5432/licencias'
        SHADOW_DATABASE_URL = 'postgresql://user:pass@localhost:5432/licencias_shadow'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Verificaciones') {
            agent {
                docker {
                    image 'node:24-bookworm'
                    // -u root: para corepack (/usr/local/bin) y apt (playwright --with-deps).
                    // Los volúmenes cachean el store de pnpm y los navegadores de Playwright.
                    args '-u root:root -v pnpm-store:/root/.local/share/pnpm/store -v ms-playwright:/root/.cache/ms-playwright'
                }
            }
            stages {
                stage('Instalar dependencias') {
                    steps {
                        // Misma versión que "packageManager" en package.json y que GitHub Actions
                        sh 'corepack enable && corepack prepare pnpm@11.8.0 --activate'
                        sh 'pnpm install --frozen-lockfile'
                    }
                }

                stage('Preparar entorno') {
                    steps {
                        sh 'cp .env.example .env'
                        sh 'pnpm prisma generate'
                    }
                }

                stage('Typecheck') {
                    steps {
                        sh 'pnpm tsc --noEmit'
                    }
                }

                stage('Lint') {
                    steps {
                        sh 'pnpm lint'
                    }
                }

                stage('Tests unitarios') {
                    steps {
                        sh 'pnpm test'
                    }
                }

                stage('Build') {
                    steps {
                        sh 'pnpm build'
                    }
                }

                // stage('Tests E2E') {
                //     // Requiere una base de datos Postgres real y accesible desde el contenedor.
                //     // Configurar E2E_DATABASE_URL en Jenkins (job o global); opcionalmente
                //     // SEED_ADMIN_* para sembrar el usuario admin y E2E_USERNAME / E2E_PASSWORD
                //     // si difieren del default de los tests.
                //     when {
                //         allOf {
                //             anyOf { branch 'main'; branch 'testing' }
                //             expression { env.E2E_DATABASE_URL?.trim() }
                //         }
                //     }
                //     environment {
                //         DATABASE_URL = "${env.E2E_DATABASE_URL}"
                //     }
                //     steps {
                //         sh 'pnpm exec playwright install --with-deps chromium'
                //         sh 'pnpm prisma migrate deploy'
                //         sh 'if [ -n "${SEED_ADMIN_USERNAME:-}" ]; then pnpm prisma db seed; fi'
                //         sh 'pnpm test:e2e'
                //     }
                //     post {
                //         always {
                //             archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                //         }
                //     }
                // }
            }
            post {
                always {
                    // El contenedor corre como root: devolver el workspace al dueño original
                    // para que el siguiente checkout no falle por archivos propiedad de root.
                    sh 'chown -R "$(stat -c "%u:%g" .)" . || true'
                }
            }
        }

        stage('Imagen') {
            // El agente Jenkins debe tener docker-cli y acceso al daemon de Docker.
            // Un solo agente garantiza que build, push y limpieza usen el mismo daemon.
            agent any
            stages {
                stage('Build imagen') {
                    steps {
                        script {
                            env.IMG_TAG = env.TAG_NAME
                                ? env.TAG_NAME.replaceFirst('^v', '')
                                : "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
                        }
                        sh 'docker build --platform linux/amd64 -t "$IMG:$IMG_TAG" .'
                    }
                }

                stage('Push a Harbor') {
                    // Solo se publica en tags semver (ej. v1.0.4). El deploy lo dispara el
                    // webhook de Harbor → job "deploy-licencias" (no va aquí).
                    when { buildingTag() }
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'harbor-licencias-push',
                                          usernameVariable: 'U', passwordVariable: 'P')]) {
                            sh 'echo "$P" | docker login "${IMG%%/*}" -u "$U" --password-stdin'
                            sh 'docker push "$IMG:$IMG_TAG"'
                        }
                    }
                }
            }
            post {
                always {
                    // Corre incluso si el build o el push falla.
                    sh '''
                        if [ -n "${IMG_TAG:-}" ]; then
                            docker image rm "$IMG:$IMG_TAG" || true
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                echo env.TAG_NAME
                    ? "OK — publicado ${env.IMG_TAG} (deploy lo dispara Harbor)"
                    : "OK — build de rama verificado (sin publicar)"
            }
        }
        failure {
            echo "Build fallido: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
