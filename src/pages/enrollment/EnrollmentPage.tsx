import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ClipboardCopy,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { createEnrollmentRequest } from '../../features/inscripcion/services/enrollmentStore';
import type { EnrollmentRequest } from '../../features/inscripcion/types';

type EnrollmentLevel = 'Inicial' | 'Primario' | 'Secundario';

type FormState = {
  studentFirstName: string;
  studentLastName: string;
  studentDni: string;
  birthDate: string;
  educationalLevel: EnrollmentLevel;
  schoolYear: string;
  turn: string;
  responsibleFullName: string;
  responsibleDni: string;
  responsibleRelation: string;
  phone: string;
  email: string;
  notes: string;
  acceptedTerms: boolean;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const levelOptions: Array<{
  level: EnrollmentLevel;
  title: string;
  description: string;
  icon: React.ReactNode;
  courses: string[];
}> = [
  {
    level: 'Inicial',
    title: 'Nivel Inicial',
    description: 'Primeros pasos en un entorno cuidado.',
    icon: <span className="text-[3.1rem] leading-none">🧸</span>,
    courses: ['Sala de 3 años', 'Sala de 4 años', 'Sala de 5 años'],
  },
  {
    level: 'Primario',
    title: 'Nivel Primario',
    description: 'Aprendizaje integral y acompanado.',
    icon: <span className="text-[3.1rem] leading-none">📚</span>,
    courses: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado'],
  },
  {
    level: 'Secundario',
    title: 'Nivel Secundario',
    description: 'Proyecto de vida y autonomia.',
    icon: <span className="text-[3.1rem] leading-none">🎓</span>,
    courses: ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año'],
  },
];

const steps = [
  'Nivel educativo',
  'Datos del alumno',
  'Responsable',
  'Confirmación',
];

const initialForm: FormState = {
  studentFirstName: '',
  studentLastName: '',
  studentDni: '',
  birthDate: '',
  educationalLevel: 'Inicial',
  schoolYear: 'Sala de 3 años',
  turn: 'Mañana',
  responsibleFullName: '',
  responsibleDni: '',
  responsibleRelation: 'Madre',
  phone: '',
  email: '',
  notes: '',
  acceptedTerms: false,
};

const sideItems = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Solicitud segura',
    text: 'Tu información está protegida y será utilizada únicamente con fines institucionales.',
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: 'Respuesta institucional',
    text: 'Nos comunicaremos por correo electrónico en un plazo de 5 días hábiles.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Seguimiento del estado',
    text: 'Podrás consultar el estado de tu solicitud desde cualquier dispositivo.',
  },
];

function getCourses(level: EnrollmentLevel) {
  return levelOptions.find((item) => item.level === level)?.courses ?? [];
}

function formatRequestNumber(request: EnrollmentRequest | null) {
  const fallback = '000123';
  const source = request?.id.replace(/\D/g, '').slice(0, 6).padStart(6, '0') || fallback;
  return `#EPT-2026-${source}`;
}

function StepHero({ activeStep }: { activeStep: number }) {
  return (
    <section className="relative overflow-hidden rounded-b-[28px] bg-edu-primary px-5 pb-12 pt-6 text-white shadow-[0_18px_40px_rgba(20,82,200,0.22)] md:rounded-[20px] md:px-10 md:pb-14 md:pt-8">
      <SchoolLineArt />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/10">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="text-[13px] font-extrabold leading-[1.05]">
            <p>Educar para</p>
            <p>Transformar</p>
          </div>
        </div>

        <h1 className="mt-8 text-[2.35rem] font-extrabold leading-none tracking-[-0.01em] md:text-[3.65rem]">
          Inscripción 2026
        </h1>
        <p className="mt-3 text-base font-medium text-white/95 md:text-lg">
          Completá la solicitud de admisión en pocos pasos.
        </p>

        <div className="mt-9 flex max-w-[560px] items-start">
          {steps.map((label, index) => {
            const number = index + 1;
            const isActive = activeStep === number;
            const isDone = activeStep > number;

            return (
              <div key={label} className="flex flex-1 items-start last:flex-none">
                <div className="flex min-w-[52px] flex-col items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-extrabold transition ${
                      isActive || isDone
                        ? 'border-white bg-white text-edu-primary'
                        : 'border-white/85 text-white'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : number}
                  </span>
                  <span className="max-w-[86px] text-center text-[10px] font-bold leading-tight text-white">
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <span className="mt-4 h-[3px] flex-1 rounded-full bg-white/75" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SchoolLineArt() {
  return (
    <svg
      className="absolute right-5 top-8 hidden h-[220px] w-[420px] opacity-25 md:block"
      viewBox="0 0 420 220"
      fill="none"
      aria-hidden="true"
    >
      <path d="M126 184V83l67-49 68 49v101" stroke="white" strokeWidth="2.5" />
      <path d="M146 184v-31h38v31M207 184v-31h38v31" stroke="white" strokeWidth="2.5" />
      <path d="M170 93h18v27h-18zM221 93h18v27h-18zM170 132h18v22h-18zM221 132h18v22h-18z" stroke="white" strokeWidth="2" />
      <circle cx="194" cy="74" r="16" stroke="white" strokeWidth="2" />
      <path d="M194 65v10l8 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M261 109h70v75h-70M126 109H56v75h70" stroke="white" strokeWidth="2.5" />
      <path d="M75 124h17v24H75zM103 124h17v24h-17zM279 124h17v24h-17zM307 124h17v24h-17z" stroke="white" strokeWidth="2" />
      <path d="M194 34V10M194 10h44l-10 13 10 13h-44" stroke="white" strokeWidth="2" />
      <path d="M41 64c9-18 37-18 45 0M306 44c9-18 37-18 45 0M354 70c9-18 37-18 45 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 184v-38M23 184v-24M344 184v-42M364 184v-28" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 146c-19 0-19-36 0-36 19 0 19 36 0 36ZM344 142c-20 0-20-38 0-38 20 0 20 38 0 38Z" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function SidePanel() {
  return (
    <aside className="rounded-[20px] border border-[#E7E2D8] bg-white px-7 py-8 shadow-[0_16px_36px_rgba(24,48,77,0.06)]">
      <div className="space-y-10">
        {sideItems.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-edu-secondary/10 text-edu-primary">
              {item.icon}
            </div>
            <div>
              <h3 className="text-[13px] font-extrabold text-[#18304D]">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#68758A]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function StepBadge({ step }: { step: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-edu-primary px-3 text-[11px] font-extrabold text-white">
      Paso {step} de 4
    </span>
  );
}

function Field({
  label,
  name,
  value,
  type = 'text',
  onChange,
  inputMode,
  error,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  type?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#68758A]">{label}</span>
      <input
        name={name}
        value={value}
        type={type}
        inputMode={inputMode}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-[10px] border bg-white px-4 text-[14px] font-medium text-[#18304D] outline-none transition placeholder:text-[#9AA5B5] focus:ring-4 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
            : 'border-[#D8DEE8] focus:border-edu-primary focus:ring-edu-primary/10'
        }`}
      />
      {error && <span className="mt-1.5 block text-[11px] font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  options: string[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#68758A]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-[10px] border bg-white px-4 text-[14px] font-medium text-[#18304D] outline-none transition focus:ring-4 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
            : 'border-[#D8DEE8] focus:border-edu-primary focus:ring-edu-primary/10'
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="mt-1.5 block text-[11px] font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function ButtonRow({
  canGoBack,
  onBack,
  onNext,
  nextLabel = 'Continuar',
  submit = false,
  disabled = false,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  submit?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 max-sm:flex-col">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#D8DEE8] bg-white px-4 text-[13px] font-extrabold text-edu-primary shadow-sm transition hover:border-edu-primary/45 hover:bg-[#F7FAFF] max-sm:w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      ) : (
        <span />
      )}

      <button
        type={submit ? 'submit' : 'button'}
        onClick={submit ? undefined : onNext}
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-edu-primary px-5 text-[13px] font-extrabold text-white shadow-[0_10px_20px_rgba(20,82,200,0.24)] transition hover:bg-edu-secondary-dark focus:outline-none focus:ring-4 focus:ring-edu-primary/20 disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full"
      >
        {nextLabel}
        {submit ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[0.8fr_1.2fr] gap-4 text-[13px]">
      <dt className="font-semibold text-[#68758A]">{label}</dt>
      <dd className="font-semibold text-[#18304D]">{value || '-'}</dd>
    </div>
  );
}

function hasNumber(value: string) {
  return /\d/.test(value);
}

function isValidDni(value: string) {
  return /^\d{7,8}$/.test(value);
}

function isValidPhone(value: string) {
  return /^\d{8,15}$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const EnrollmentPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedRequest, setSubmittedRequest] = useState<EnrollmentRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestNumber = useMemo(() => formatRequestNumber(submittedRequest), [submittedRequest]);

  const selectedCourses = getCourses(formData.educationalLevel);

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    const nextValue =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : value;

    setFormData((current) => ({ ...current, [name]: nextValue }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name as keyof FormState];
      return next;
    });
    setError(null);
  };

  const chooseLevel = (level: EnrollmentLevel) => {
    const courses = getCourses(level);
    setFormData((current) => ({
      ...current,
      educationalLevel: level,
      schoolYear: courses[0] ?? '',
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.educationalLevel;
      delete next.schoolYear;
      return next;
    });
  };

  const validateCurrentStep = () => {
    const errors: FieldErrors = {};

    if (step === 1) {
      if (!formData.educationalLevel || !formData.schoolYear) {
        errors.schoolYear = 'Seleccioná un curso.';
      }
    }

    if (step === 2) {
      if (!formData.studentFirstName.trim()) errors.studentFirstName = 'Ingresá el nombre.';
      if (!formData.studentLastName.trim()) errors.studentLastName = 'Ingresá el apellido.';
      if (!formData.studentDni.trim()) errors.studentDni = 'Ingresá el DNI.';
      if (!formData.birthDate.trim()) errors.birthDate = 'Seleccioná la fecha.';
      if (!formData.educationalLevel) errors.educationalLevel = 'Seleccioná un nivel.';
      if (!formData.schoolYear) errors.schoolYear = 'Seleccioná una sala o curso.';
      if (!formData.turn) errors.turn = 'Seleccioná un turno.';

      if (formData.studentFirstName.trim() && hasNumber(formData.studentFirstName)) {
        errors.studentFirstName = 'No puede contener números.';
      }

      if (formData.studentLastName.trim() && hasNumber(formData.studentLastName)) {
        errors.studentLastName = 'No puede contener números.';
      }

      if (formData.studentDni.trim()) {
        if (!/^\d+$/.test(formData.studentDni)) {
          errors.studentDni = 'Usá solo números.';
        } else if (!isValidDni(formData.studentDni)) {
          errors.studentDni = 'Debe tener 7 u 8 números.';
        }
      }

      if (formData.birthDate.trim()) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        birthDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
          errors.birthDate = 'No puede ser futura.';
        }
      }
    }

    if (step === 3) {
      if (!formData.responsibleFullName.trim()) errors.responsibleFullName = 'Ingresá el nombre completo.';
      if (!formData.responsibleDni.trim()) errors.responsibleDni = 'Ingresá el DNI.';
      if (!formData.responsibleRelation) errors.responsibleRelation = 'Seleccioná un vínculo.';
      if (!formData.phone.trim()) errors.phone = 'Ingresá el teléfono.';
      if (!formData.email.trim()) errors.email = 'Ingresá el correo electrónico.';

      if (formData.responsibleFullName.trim() && hasNumber(formData.responsibleFullName)) {
        errors.responsibleFullName = 'No puede contener números.';
      }

      if (formData.responsibleDni.trim()) {
        if (!/^\d+$/.test(formData.responsibleDni)) {
          errors.responsibleDni = 'Usá solo números.';
        } else if (!isValidDni(formData.responsibleDni)) {
          errors.responsibleDni = 'Debe tener 7 u 8 números.';
        } else if (
          formData.studentDni.replace(/\D/g, '') === formData.responsibleDni.replace(/\D/g, '')
        ) {
          errors.responsibleDni = 'No puede ser igual al DNI del alumno.';
        }
      }

      if (formData.phone.trim()) {
        if (!/^\d+$/.test(formData.phone)) {
          errors.phone = 'Usá solo números.';
        } else if (!isValidPhone(formData.phone)) {
          errors.phone = 'Debe tener entre 8 y 15 números.';
        }
      }

      if (formData.email.trim() && !isValidEmail(formData.email)) {
        errors.email = 'Ingresá un correo válido.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(null);
      return false;
    }

    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setError(null);
    setStep((current) => Math.min(current + 1, 4));
  };

  const goBack = () => {
    setError(null);
    setFieldErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.acceptedTerms) {
      setFieldErrors({ acceptedTerms: 'Debés aceptar para enviar la solicitud.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const request = createEnrollmentRequest(formData);
      setSubmittedRequest(await request);
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo registrar la solicitud.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 5) {
    return (
      <main className="min-h-screen bg-[#F4F0E8] px-4 py-10 font-sans text-[#18304D] md:py-16">
        <section className="mx-auto grid min-h-[620px] max-w-[760px] place-items-center rounded-[20px] bg-[radial-gradient(circle_at_center,#fff_0%,#fff_45%,#F4F0E8_100%)] px-4">
          <div className="w-full max-w-[520px] rounded-[24px] bg-white px-7 py-10 text-center shadow-[0_24px_70px_rgba(24,48,77,0.13)] md:px-12 md:py-12">
            <div className="relative mx-auto mb-7 grid h-28 w-28 place-items-center">
              <span className="absolute left-0 top-4 h-2 w-2 rounded-full bg-[#F4B400]" />
              <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-edu-secondary-light" />
              <span className="absolute bottom-5 left-3 h-2 w-2 rounded-full bg-[#FF8A80]" />
              <span className="absolute bottom-1 right-8 h-2 w-2 rounded-full bg-[#F4B400]" />
              <span className="absolute left-7 top-0 h-8 w-1 rotate-[-28deg] rounded-full bg-edu-secondary-light" />
              <span className="absolute right-8 top-8 h-8 w-1 rotate-[34deg] rounded-full bg-[#FFCC80]" />
              <span className="grid h-24 w-24 place-items-center rounded-full bg-edu-accent text-white shadow-[0_18px_34px_rgba(72,184,67,0.3)]">
                <Check className="h-12 w-12 stroke-[4]" />
              </span>
            </div>

            <h1 className="text-[1.75rem] font-extrabold leading-tight text-edu-primary md:text-[2rem]">
              ¡Solicitud recibida!
            </h1>
            <p className="mx-auto mt-5 max-w-[370px] text-[17px] leading-relaxed text-[#4F5F75]">
              Queda pendiente de revisión por administración. Te contactaremos cuando
              el panel institucional apruebe o actualice el estado de la inscripción.
            </p>

            <div className="mx-auto mt-8 rounded-[10px] bg-[#F7F4EF] px-5 py-6">
              <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Pendiente de aprobación
              </p>
              <p className="text-[12px] font-semibold text-[#8A93A3]">Número de solicitud</p>
              <div className="mt-3 flex items-center justify-center gap-3 text-[1.45rem] font-extrabold tracking-wide text-[#18304D]">
                {requestNumber}
                <ClipboardCopy className="h-5 w-5 text-[#6D7890]" />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-5">
              <Link
                to="/"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[10px] bg-edu-primary px-8 text-[15px] font-extrabold text-white transition hover:bg-edu-secondary-dark"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F0E8] font-sans text-[#18304D]">
      <div className="mx-auto max-w-[1180px] px-3 pb-10 md:px-4 md:pt-4">
        <StepHero activeStep={step} />

        <section className="-mt-5 grid gap-4 rounded-t-[24px] bg-white/70 p-3 shadow-[0_-2px_0_rgba(255,255,255,0.75)] md:grid-cols-[1fr_300px] md:gap-4 md:p-5 lg:grid-cols-[1fr_310px]">
          <form
            onSubmit={submitRequest}
            className="min-h-[560px] rounded-[20px] border border-[#E7E2D8] bg-white px-5 py-7 shadow-[0_16px_36px_rgba(24,48,77,0.06)] md:px-8"
          >
            {error && (
              <div className="mb-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <StepBadge step={1} />
                <h2 className="mt-4 text-[1.35rem] font-extrabold text-[#18304D]">
                  Seleccioná el nivel educativo
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#68758A]">
                  Elegí el nivel que deseas inscribir al alumno para ver las opciones disponibles.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {levelOptions.map((item) => {
                    const active = formData.educationalLevel === item.level;

                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => chooseLevel(item.level)}
                        className={`relative min-h-[210px] rounded-[14px] border bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(24,48,77,0.08)] ${
                          active
                            ? 'border-edu-primary bg-[#F7FAFF] shadow-[0_10px_26px_rgba(20,82,200,0.12)]'
                            : 'border-[#DDE3EC]'
                        }`}
                      >
                        {active && (
                          <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-edu-primary text-white">
                            <Check className="h-4 w-4 stroke-[4]" />
                          </span>
                        )}
                        <div className="mb-5 flex justify-center">{item.icon}</div>
                        <h3 className="text-[17px] font-extrabold text-[#18304D]">{item.title}</h3>
                        <p className="mx-auto mt-3 max-w-[170px] text-[12px] leading-relaxed text-[#68758A]">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[14px] border border-[#E4E8EF] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-extrabold text-[#18304D]">Cursos disponibles</p>
                    <span className="text-[#68758A]">⌄</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedCourses.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, schoolYear: course }))}
                        className={`h-9 rounded-[8px] px-4 text-[12px] font-extrabold transition ${
                          formData.schoolYear === course
                            ? 'bg-edu-primary text-white shadow-[0_8px_18px_rgba(20,82,200,0.22)]'
                            : 'border border-[#D8DEE8] bg-white text-[#68758A] hover:border-edu-primary/50'
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>

                <ButtonRow canGoBack={false} onBack={goBack} onNext={goNext} />
              </div>
            )}

            {step === 2 && (
              <div>
                <StepBadge step={2} />
                <h2 className="mt-4 text-[1.35rem] font-extrabold text-[#18304D]">
                  Datos del alumno
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#68758A]">
                  Completá la información personal y académica.
                </p>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-[14px] border border-[#DDE3EC] p-5 md:p-6">
                    <h3 className="mb-6 text-[16px] font-extrabold text-[#18304D]">
                      Datos personales
                    </h3>
                    <div className="space-y-5">
                      <Field label="Nombre" name="studentFirstName" value={formData.studentFirstName} onChange={updateField} error={fieldErrors.studentFirstName} />
                      <Field label="Apellido" name="studentLastName" value={formData.studentLastName} onChange={updateField} error={fieldErrors.studentLastName} />
                      <Field label="DNI" name="studentDni" value={formData.studentDni} onChange={updateField} inputMode="numeric" error={fieldErrors.studentDni} />
                      <Field label="Fecha de nacimiento" name="birthDate" value={formData.birthDate} type="date" onChange={updateField} error={fieldErrors.birthDate} />
                    </div>
                  </section>

                  <section className="rounded-[14px] border border-[#DDE3EC] p-5 md:p-6">
                    <h3 className="mb-6 text-[16px] font-extrabold text-[#18304D]">
                      Datos académicos
                    </h3>
                    <div className="space-y-5">
                      <SelectField label="Nivel educativo" name="educationalLevel" value={formData.educationalLevel} options={['Inicial', 'Primario', 'Secundario']} onChange={(event) => chooseLevel(event.target.value as EnrollmentLevel)} error={fieldErrors.educationalLevel} />
                      <SelectField label="Sala o curso" name="schoolYear" value={formData.schoolYear} options={selectedCourses} onChange={updateField} error={fieldErrors.schoolYear} />
                      <SelectField label="Turno" name="turn" value={formData.turn} options={['Mañana', 'Tarde', 'Jornada completa']} onChange={updateField} error={fieldErrors.turn} />
                    </div>
                  </section>
                </div>

                <ButtonRow canGoBack onBack={goBack} onNext={goNext} />
              </div>
            )}

            {step === 3 && (
              <div>
                <StepBadge step={3} />
                <h2 className="mt-4 text-[1.35rem] font-extrabold text-[#18304D]">
                  Datos del adulto responsable
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#68758A]">
                  Informanos quién acompañará al alumno en este proceso.
                </p>

                <div className="mt-9 space-y-6">
                  <Field label="Nombre completo" name="responsibleFullName" value={formData.responsibleFullName} onChange={updateField} error={fieldErrors.responsibleFullName} />
                  <Field label="DNI" name="responsibleDni" value={formData.responsibleDni} onChange={updateField} inputMode="numeric" error={fieldErrors.responsibleDni} />
                  <SelectField label="Vínculo" name="responsibleRelation" value={formData.responsibleRelation} options={['Madre', 'Padre', 'Tutor']} onChange={updateField} error={fieldErrors.responsibleRelation} />
                  <Field label="Teléfono" name="phone" value={formData.phone} onChange={updateField} inputMode="numeric" error={fieldErrors.phone} />
                  <Field label="Correo electrónico" name="email" value={formData.email} type="email" onChange={updateField} error={fieldErrors.email} />
                </div>

                <ButtonRow canGoBack onBack={goBack} onNext={goNext} />
              </div>
            )}

            {step === 4 && (
              <div>
                <StepBadge step={4} />
                <h2 className="mt-4 text-[1.35rem] font-extrabold text-[#18304D]">
                  Observaciones y confirmación
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#68758A]">
                  Revisá los datos y enviá tu solicitud.
                </p>

                <div className="mt-8 rounded-[14px] border border-[#DDE3EC] p-5">
                  <label className="block">
                    <span className="mb-2 block text-[12px] font-semibold text-[#68758A]">
                      Observaciones (opcional)
                    </span>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={updateField}
                      rows={4}
                      placeholder="Escribí aquí cualquier información adicional que consideres importante."
                      className="w-full resize-none rounded-[10px] border border-[#D8DEE8] bg-white px-4 py-3 text-[14px] font-medium text-[#18304D] outline-none transition placeholder:text-[#9AA5B5] focus:border-edu-primary focus:ring-4 focus:ring-edu-primary/10"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-[14px] border border-[#DDE3EC] p-5">
                  <h3 className="mb-5 text-[15px] font-extrabold text-[#18304D]">
                    Resumen de la solicitud
                  </h3>
                  <dl className="space-y-3">
                    <SummaryLine label="Alumno" value={`${formData.studentFirstName} ${formData.studentLastName}`.trim()} />
                    <SummaryLine label="Nivel educativo" value={formData.educationalLevel} />
                    <SummaryLine label="Sala o curso" value={formData.schoolYear} />
                    <SummaryLine label="Turno" value={formData.turn} />
                    <SummaryLine label="Responsable" value={formData.responsibleFullName} />
                    <SummaryLine label="Correo electrónico" value={formData.email} />
                    <SummaryLine label="Teléfono" value={formData.phone} />
                  </dl>
                </div>

                <div className="mt-5">
                  <label
                    className={`flex items-start gap-3 rounded-[10px] border px-3 py-3 text-[12px] font-medium leading-relaxed text-[#4F5F75] ${
                      fieldErrors.acceptedTerms
                        ? 'border-red-300 bg-red-50/70'
                        : 'border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      checked={formData.acceptedTerms}
                      onChange={updateField}
                      className="mt-0.5 h-4 w-4 rounded border-[#D8DEE8] accent-edu-primary"
                    />
                    <span>
                      Acepto el tratamiento de datos y confirmo que la información es correcta.
                    </span>
                  </label>
                  {fieldErrors.acceptedTerms && (
                    <span className="mt-1.5 block text-[11px] font-semibold text-red-600">
                      {fieldErrors.acceptedTerms}
                    </span>
                  )}
                </div>

                <ButtonRow
                  canGoBack
                  onBack={goBack}
                  submit
                  disabled={isSubmitting}
                  nextLabel={isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                />
              </div>
            )}
          </form>

          <SidePanel />
        </section>
      </div>
    </main>
  );
};
