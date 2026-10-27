import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import imagenHero from '../../assets/service/hero-trabaja-con-nosotros.png';
import { Button } from '../../shared/components/ui/Button';

/**
 * Página de Postulación Laboral "Trabajá con Nosotros".
 * Permite la carga de datos personales, puesto deseado y adjuntar el CV en PDF mediante arrastrar y soltar (Drag-and-Drop).
 */
export const JobsPage: React.FC = () => {
  // Estado local para almacenar los datos textuales de los campos del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Docente Nivel Inicial',
    message: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencia mutable para controlar el selector de archivos input nativo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestor del cambio de campos textuales e inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validador y gestor del archivo cargado a través del input tradicional
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validamos que el archivo sea exclusivamente de formato PDF
      if (file.type !== 'application/pdf') {
        setError('Únicamente se permiten archivos en formato PDF.');
        setSelectedFile(null);
        return;
      }
      
      // Validamos que el archivo pese menos o igual a 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo supera el tamaño máximo permitido de 5MB.');
        setSelectedFile(null);
        return;
      }
      
      setError(null);
      setSelectedFile(file);
    }
  };

  // Previene el comportamiento por defecto al arrastrar sobre el área para habilitar la soltura
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Capturador del archivo soltado dentro de la zona interactiva (Drag-and-Drop)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.type !== 'application/pdf') {
        setError('Únicamente se permiten archivos en formato PDF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo supera el tamaño máximo permitido de 5MB.');
        return;
      }
      
      setError(null);
      setSelectedFile(file);
    }
  };

  // Limpia el archivo seleccionado y resetea el valor del selector input
  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el evento clic de la caja contenedora
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Prepare an email draft; this page has no application endpoint or CV storage.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Por favor completá todos los campos requeridos (*).');
      return;
    }
    if (!selectedFile) {
      setError('Por favor adjuntá tu Currículum Vitae en formato PDF.');
      return;
    }

    setError(null);
    const subject = `Postulación laboral: ${formData.position}`;
    const body = [
      `Nombre: ${formData.name.trim()}`,
      `Correo: ${formData.email.trim()}`,
      `Teléfono: ${formData.phone.trim()}`,
      `Puesto: ${formData.position}`,
      `Archivo CV para adjuntar: ${selectedFile.name}`,
      '',
      formData.message.trim(),
    ].join('\n');
    window.location.href = `mailto:contacto@educarparatransformar.edu.ar?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsSubmitted(true); // Cambia el estado para desplegar la confirmación de éxito
  };

  // Restablece todos los estados al valor inicial para permitir una nueva postulación
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'Docente Nivel Inicial',
      message: '',
    });
    setSelectedFile(null);
    setIsSubmitted(false);
  };

  return (
    <div className="animate-fadeIn">
      {/* Sección Hero: Encabezado descriptivo de la sección */}
      <section className="bg-gradient-to-br from-edu-primary to-edu-secondary text-white py-16 px-4 text-center relative overflow-hidden">
        <img src={imagenHero} alt="" className='absolute inset-0 w-full h-full object-cover opacity-50' />
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Trabajá con nosotros</h1>
          <p className="text-edu-accent text-sm md:text-base max-w-xl mx-auto">
            Sumate a nuestro equipo docente y no docente para transformar juntos el futuro de la educación
          </p>
        </div>
      </section>

      {/* Sección del Formulario */}
      <section className="py-12 max-w-xl mx-auto px-4">
        <div className="bg-edu-card border border-slate-200/60 rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-bold text-edu-primary mb-6 pb-2 border-b border-edu-light uppercase tracking-wide">
            Enviar currículum
          </h2>

          {isSubmitted ? (
            /* Pantalla Animada de Éxito */
              <div className="text-center py-8 space-y-4 animate-scaleUp" role="status" aria-live="polite">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-sm font-bold text-edu-dark">Borrador de postulación preparado</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Intentamos abrir tu aplicación de correo. Si se abrió, revisá el mensaje, adjuntá manualmente el archivo <strong>{selectedFile?.name}</strong> y presioná Enviar. La página no transmite el CV ni puede confirmar la recepción.
              </p>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="mt-4"
              >
                ENVIAR OTRA POSTULACIÓN
              </Button>
            </div>
          ) : (
            /* Formulario Interactivo */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-center gap-2" role="alert">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nombre completo */}
              <div className="space-y-1">
                <label htmlFor="job-name" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="job-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  className="w-full h-9 px-3 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-edu-primary focus:border-edu-primary bg-white transition-all text-edu-dark"
                  required
                />
              </div>

              {/* Fila Correo y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Correo */}
                <div className="space-y-1">
                  <label htmlFor="job-email" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="job-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej: juan@gmail.com"
                    className="w-full h-9 px-3 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-edu-primary focus:border-edu-primary bg-white transition-all text-edu-dark"
                    required
                  />
                </div>
                {/* Teléfono */}
                <div className="space-y-1">
                  <label htmlFor="job-phone" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                    Teléfono de contacto *
                  </label>
                  <input
                    type="tel"
                    id="job-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej: 3624123456"
                    className="w-full h-9 px-3 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-edu-primary focus:border-edu-primary bg-white transition-all text-edu-dark"
                    required
                  />
                </div>
              </div>

              {/* Puesto deseado */}
              <div className="space-y-1">
                <label htmlFor="job-position" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                  Puesto al que se postula *
                </label>
                <select
                  id="job-position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full h-9 px-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-edu-primary focus:border-edu-primary bg-white transition-all text-edu-dark cursor-pointer"
                >
                  <option value="Docente Nivel Inicial">Docente Nivel Inicial</option>
                  <option value="Docente Nivel Primario">Docente Nivel Primario</option>
                  <option value="Docente Nivel Secundario">Docente Nivel Secundario</option>
                  <option value="Personal Administrativo">Personal Administrativo</option>
                  <option value="Personal de Maestranza y Servicios">Personal de Maestranza y Servicios</option>
                </select>
              </div>

              {/* Área interactiva Drag-and-Drop de PDF */}
              <div className="space-y-1">
                <label htmlFor="job-cv" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                  Adjuntar Currículum Vitae (PDF) *
                </label>
                
                <input
                  id="job-cv"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  aria-label="Seleccionar currículum en PDF"
                  className="sr-only"
                />

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 p-5 text-center rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                >
                  {selectedFile ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 text-xs text-edu-dark shadow-sm">
                      <FileText size={16} className="text-edu-primary shrink-0" />
                      <span className="font-semibold max-w-[220px] truncate">{selectedFile.name}</span>
                      <Button
                        type="button"
                        onClick={removeFile}
                        variant="danger"
                        size="sm"
                        aria-label={`Quitar archivo ${selectedFile.name}`}
                        className="min-h-9 px-2"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-edu-primary" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Seleccionar CV PDF
                      </Button>
                      <span className="text-[10px] text-slate-700">
                        También podés arrastrar el archivo aquí
                      </span>
                      <span className="text-[10px] text-slate-600">
                        Formatos permitidos: PDF. Máx 5MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Mensaje o presentación breve */}
              <div className="space-y-1">
                <label htmlFor="job-message" className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                  Breve presentación / Mensaje
                </label>
                <textarea
                  id="job-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Contanos brevemente sobre tu experiencia e interés en formar parte..."
                  className="w-full p-3 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-edu-primary focus:border-edu-primary bg-white transition-all text-edu-dark h-20 resize-none"
                />
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                size="lg"
                className="w-full uppercase tracking-wider"
              >
                ENVIAR POSTULACIÓN
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
