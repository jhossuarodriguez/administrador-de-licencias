'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Building, Calendar, DollarSign, Users, Settings, CheckCircle, Minus } from "lucide-react";
import { useState } from "react";

export default function AddLicensePage() {

    const [formData, setFormData] = useState({
        sede: '',
        provider: '',
        startDate: '',
        expiration: '',
        assigned: '',
        assignedDept: '',
        model: '',
        plan: '',
        unitCost: '',
        installmentCost: '',
        billingCycle: 'MONTHLY',
        totalLicense: '',
        active: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpiar mensaje de error/éxito cuando el usuario empiece a escribir
        if (submitMessage) {
            setSubmitMessage(null);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const licenseData = {
                sede: formData.sede || null,
                provider: formData.provider,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                expiration: formData.expiration ? new Date(formData.expiration).toISOString() : null,
                assigned: formData.assigned || null,
                assignedDept: formData.assignedDept || null,
                model: formData.model || null,
                plan: formData.plan || null,
                unitCost: parseFloat(formData.unitCost) || 0,
                installmentCost: parseFloat(formData.installmentCost) || 0,
                billingCycle: formData.billingCycle,
                totalLicense: parseInt(formData.totalLicense) || 0,
                active: formData.active
            };

            const response = await fetch('/api/licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(licenseData),
            });

            if (response.ok) {
                const newLicense = await response.json();
                console.log('Licencia agregada:', newLicense);
                setSubmitMessage({ type: 'success', text: 'Licencia agregada exitosamente' });

                // Limpiar el formulario
                setFormData({
                    sede: '',
                    provider: '',
                    startDate: '',
                    expiration: '',
                    assigned: '',
                    assignedDept: '',
                    model: '',
                    plan: '',
                    unitCost: '',
                    installmentCost: '',
                    billingCycle: 'MONTHLY',
                    totalLicense: '',
                    active: true
                });

            } else {
                const errorData = await response.json();
                setSubmitMessage({ type: 'error', text: errorData.error || 'Error al crear la licencia' });
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmitMessage({ type: 'error', text: 'Error de conexión al crear la licencia' });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="flex flex-col mx-4 mt-0 md:mt-10 md:mx-7 space-y-6">
            <div className="mb-10 flex flex-row items-center mx-4 md:mx-7">
                <div className="flex flex-col justify-between flex-1 mt-10 md:mt-0">
                    <header className="text-2xl font-bold">Agregar nueva licencia</header>
                    <p className="mt-1 text-gray-600">
                        Complete el formulario para agregar una nueva licencia al sistema.
                    </p>
                </div>
            </div>

            {/* Formulario para agregar una nueva licencia */}
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-6 max-w-6xl mb-5 w-full mx-auto"
            >
                {/* Grid de 2 columnas con filas pareadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                    {/* Fila 1: Proveedor / Sede */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="provider" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Key className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Proveedor *
                        </Label>
                        <Input
                            id="provider"
                            name="provider"
                            type="text"
                            value={formData.provider}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="Ej. Microsoft, Adobe, Google"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="sede" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Building className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Sede
                        </Label>
                        <select
                            id="sede"
                            name="sede"
                            value={formData.sede}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary appearance-none pr-10 text-thirdary"
                        >
                            <option value="">Selecciona una sede</option>
                            <option value="SDO">Santo Domingo Oeste (SDO)</option>
                            <option value="SCL">Santiago de los Caballeros (SCL)</option>
                            <option value="SJM">San Juan de la Maguana (SJM)</option>
                            <option value="SDE">Santo Domingo Este (SDE)</option>
                        </select>
                    </div>

                    {/* Fila 2: Modelo / Ciclo de Facturación */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="model" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Settings className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Modelo
                        </Label>
                        <Input
                            id="model"
                            name="model"
                            type="text"
                            value={formData.model}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="Ej. Office 365, Creative Cloud"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="billingCycle" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Calendar className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Ciclo de Facturación *
                        </Label>
                        <select
                            id="billingCycle"
                            name="billingCycle"
                            value={formData.billingCycle}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary appearance-none pr-10 text-thirdary"
                        >
                            <option value="MONTHLY">Mensual</option>
                            <option value="YEARLY">Anual</option>
                        </select>
                    </div>


                    {/* Fila 3: Fecha de Inicio / Checkbox Licencia activa */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="startDate" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Calendar className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Fecha de Inicio
                        </Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="expiration" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Calendar className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Fecha de Expiración
                        </Label>
                        <Input
                            id="expiration"
                            name="expiration"
                            type="date"
                            value={formData.expiration}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                        />
                    </div>

                    {/* Fila 4: Asignado / Departamento Asignado */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="assigned" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Users className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Asignado
                        </Label>
                        <Input
                            id="assigned"
                            name="assigned"
                            type="text"
                            value={formData.assigned}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="Nombre del asignado"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="assignedDept" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Building className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Departamento Asignado
                        </Label>
                        <Input
                            id="assignedDept"
                            name="assignedDept"
                            type="text"
                            value={formData.assignedDept}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="Departamento asignado"
                        />
                    </div>

                    {/* Fila 5: Costo Unitario / Total de Licencias */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="unitCost" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <DollarSign className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Costo Unitario *
                        </Label>
                        <Input
                            id="unitCost"
                            name="unitCost"
                            type="number"
                            step="0.01"
                            value={formData.unitCost}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="totalLicense" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <Users className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Total de Licencias
                        </Label>
                        <Input
                            id="totalLicense"
                            name="totalLicense"
                            type="number"
                            value={formData.totalLicense}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="0"
                        />
                    </div>

                    {/* Fila 6: Plan / Fecha de Expiración */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="plan" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <CheckCircle className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Plan
                        </Label>
                        <Input
                            id="plan"
                            name="plan"
                            type="text"
                            value={formData.plan}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="Ej. Business Premium, Enterprise"
                        />
                    </div>

                    {/* Fila 6: Costos de Instalacion / Fecha de Expiración */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="installmentCost" className="flex items-center gap-3 text-base font-medium text-thirdary">
                            <CheckCircle className="rounded-xl p-2.5 size-9 text-white bg-secondary/80 shadow-[0_6px_18px_-6px_rgba(68,173,226,0.7)]" />
                            Costos de Instalacion
                        </Label>
                        <Input
                            id="installmentCost"
                            name="installmentCost"
                            type="number"
                            value={formData.installmentCost}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm h-12 px-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-thirdary"
                            placeholder="0"
                        />
                    </div>


                    {/* Checkbox con altura igual a la fila */}
                    <div className="flex items-center h-12 px-3 mt-auto">
                        <Input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleChange}
                            className="w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary focus:ring-2"
                        />
                        <Label htmlFor="active" className="ml-3 text-base text-gray-700 cursor-pointer select-none">
                            Licencia activa
                        </Label>
                    </div>

                </div>

                {/* Mensaje */}
                {submitMessage && (
                    <div
                        className={`mt-5 mb-4 p-3 rounded-md ${submitMessage.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                    >
                        {submitMessage.text}
                    </div>
                )}

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200 justify-center items-center">
                    <div className="group">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-60 cursor-pointer py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${isSubmitting
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "text-white bg-secondary/80 shadow-lg shadow-secondary/40 group-hover:shadow-xl group-hover:shadow-secondary/60 group-hover:scale-[1.02]"
                                }`}
                        >
                            <Users size={20} />
                            {isSubmitting ? "Creando..." : "Crear Licencia"}
                        </button>
                    </div>

                    <div className="group">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            className="w-60 cursor-pointer bg-primary text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/60 group-hover:scale-[1.02] flex items-center justify-center gap-2 transition-all duration-300"
                            onClick={() =>
                                setFormData({
                                    sede: "",
                                    provider: "",
                                    startDate: "",
                                    expiration: "",
                                    assigned: "",
                                    assignedDept: "",
                                    model: "",
                                    plan: "",
                                    unitCost: "",
                                    installmentCost: "",
                                    billingCycle: "MONTHLY",
                                    totalLicense: "",
                                    active: true,
                                })
                            }
                        >
                            <Minus size={20} />
                            Limpiar Formulario
                        </button>
                    </div>
                </div>
            </form>


        </div>
    )
}