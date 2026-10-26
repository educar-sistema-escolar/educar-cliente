import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

const contactData = {
  address: 'Av. Sarmiento 1250',
  phone: '(0362) 445-1820',
  email: 'contacto@educarparatransformar.edu.ar',
};

export const ContactSection: React.FC = () => {
  const [success, setSuccess] = useState(false);

  return (
    <section
      id="contacto"
      className="relative flex items-center justify-center overflow-hidden px-6 pb-20 pt-6"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-edu-accent/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <div className="mx-auto mb-12 w-full max-w-4xl border-t border-slate-300/50" />

        <div className="mb-4 inline-block rounded-full border border-slate-100 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-edu-primary shadow-sm">
          Hablemos
        </div>

        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-edu-dark md:text-4xl">
          Tienes alguna duda o consulta?
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-base text-slate-500">
          Nuestro equipo de admisiones esta listo para ayudarte. Escribenos y
          te responderemos a la brevedad.
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-edu-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <MapPin size={16} />
            </div>
            <span>{contactData.address}</span>
          </div>
          <a href={`tel:${contactData.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 transition-colors hover:text-edu-primary focus-visible:rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Phone size={16} />
            </div>
            <span>{contactData.phone}</span>
          </a>
          <a href={`mailto:${contactData.email}`} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 transition-colors hover:text-edu-primary focus-visible:rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Mail size={16} />
            </div>
            <span>{contactData.email}</span>
          </a>
        </div>

        <div className="mx-auto max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-left shadow-xl shadow-slate-200/40 md:p-10">
          {success ? (
            <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-5">
              <p className="text-sm font-bold text-emerald-800">Consulta preparada en tu correo</p>
              <p className="text-sm leading-relaxed text-emerald-700" role="status">
                Intentamos abrir tu aplicación de correo con el mensaje preparado. Si se abrió, revisá los datos y presioná Enviar; esta página no puede confirmar su entrega. Si no se abrió, escribinos a {contactData.email}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/inscripcion"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-edu-primary px-4 text-sm font-semibold text-white transition hover:bg-edu-secondary"
                >
                  Ir a inscripción
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSuccess(false)}
                >
                  Enviar otra consulta
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const subject = `Consulta institucional de ${String(formData.get('name') ?? '').trim()}`;
                const body = [
                  `Nombre: ${String(formData.get('name') ?? '').trim()}`,
                  `Correo: ${String(formData.get('email') ?? '').trim()}`,
                  '',
                  String(formData.get('message') ?? '').trim(),
                ].join('\n');
                window.location.href = `mailto:${contactData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                setSuccess(true);
              }}
            >
              <div className="space-y-1">
                <label htmlFor="contact-name" className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="Ingresa tu nombre"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-edu-primary focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-email" className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Correo
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-edu-primary focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Mensaje
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-edu-primary focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="group mt-2 w-full shadow-md shadow-blue-900/15"
              >
                <span>Enviar Consulta</span>
                <Send size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
