import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Heart, Trophy, BookOpen, ChevronDown, ChevronUp, Quote,
  Users, Stethoscope, Utensils, Bus, ShieldCheck, 
  GraduationCap, Smile, MessageSquare, Activity, ArrowRight
} from 'lucide-react';
import imagenHero from '../assets/service/hero-bienestar-estudiantil.jpg';

interface FAQ {
  question: string;
  answer: string;
}

const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = 'duration-700' }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Una vez que se despliega, dejamos de observar para mejorar rendimiento
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { 
        rootMargin: '-60px 0px -60px 0px', // Activa el efecto un poquito antes de que aparezca
        threshold: 0.05 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all ${delay} ease-out ${
        isIntersecting 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12'
      }`}
    >
      {children}
    </div>
  );
};

const pilares = [
  { icon: <Brain size={26} />, title: 'Gabinete Psicopedagógico', desc: 'Apoyo emocional y orientación escolar personalizada para superar desafíos de aprendizaje.' },
  { icon: <Heart size={26} />, title: 'Salud y Nutrición', desc: 'Seguimiento de hábitos saludables, coordinación de la enfermería y menús del comedor.' },
  { icon: <Trophy size={26} />, title: 'Actividades Extracurriculares', desc: 'Talleres formativos, disciplinas artísticas y proyectos de fuerte impacto comunitario.' },
  { icon: <BookOpen size={26} />, title: 'Tutorías', desc: 'Espacios de refuerzo personalizado para consolidar los objetivos académicos individuales.' },
];

const servicios = [
  { icon: <Users size={26} />, title: 'Acompañamiento Estudiantil', desc: 'Orientación psicopedagógica y talleres de contención emocional para los alumnos.' },
  { icon: <Stethoscope size={26} />, title: 'Enfermería', desc: 'Atención primaria de salud y asistencia inmediata ante cualquier eventualidad médica.' },
  { icon: <Utensils size={26} />, title: 'Comedor Escolar', desc: 'Menús balanceados y supervisados por especialistas para un óptimo desarrollo.' },
  { icon: <Trophy size={26} />, title: 'Actividades Deportivas', desc: 'Fomento de la salud física, el compañerismo y la disciplina a través del deporte.' },
  { icon: <Bus size={26} />, title: 'Transporte Escolar', desc: 'Servicio seguro, regulado y coordinado para la tranquilidad de las familias.' },
  { icon: <ShieldCheck size={26} />, title: 'Espacios Seguros', desc: 'Ambientes e infraestructura diseñados para garantizar una convivencia sana y protegida.' },
];

const tabsCrecimiento = [
  {
    id: 'Académico',
    label: 'Académico',
    icon: <GraduationCap size={20} />,
    title: 'Excelencia y Desarrollo Cognitivo',
    desc: 'Nos enfocamos en brindar herramientas clave para el autoaprendizaje continuo, estimulando el pensamiento crítico, la curiosidad científica y el máximo rendimiento pedagógico adaptado a cada etapa del estudiante.',
    colorClass: 'text-edu-primary bg-edu-secondary/10 border-edu-secondary/30',
    accentBg: 'bg-edu-primary'
  },
  {
    id: 'Emocional',
    label: 'Emocional',
    icon: <Smile size={20} />,
    title: 'Acompañamiento y Resiliencia',
    desc: 'Gestionamos espacios seguros para el autoconocimiento, la inteligencia emocional y el desarrollo de la autoestima. Nuestro equipo psicopedagógico acompaña activamente para contener y dotar de herramientas de resolución afectiva.',
    colorClass: 'text-edu-magenta bg-edu-magenta/10 border-edu-magenta/25',
    accentBg: 'bg-edu-magenta'
  },
  {
    id: 'Social',
    label: 'Social',
    icon: <MessageSquare size={20} />,
    title: 'Convivencia y Sentido de Comunidad',
    desc: 'Fomentamos la construcción de vínculos sanos, la empatía, los valores ciudadanos y el trabajo colaborativo. Impulsamos actividades colectivas donde cada estudiante aprende el valor del respeto mutuo y la vida en sociedad.',
    colorClass: 'text-edu-secondary-dark bg-edu-secondary/10 border-edu-secondary/30',
    accentBg: 'bg-edu-secondary-dark'
  },
  {
    id: 'Físico',
    label: 'Físico',
    icon: <Activity size={20} />,
    title: 'Hábitos Saludables y Vitalidad',
    desc: 'Promovemos el bienestar corporal a través de la educación física, disciplinas deportivas y una nutrición balanceada. Entendemos el movimiento y el cuidado del cuerpo como pilares fundamentales para un cerebro activo y sano.',
    colorClass: 'text-edu-accent-warm bg-edu-accent-warm/10 border-edu-accent-warm/30',
    accentBg: 'bg-edu-accent-warm'
  }
];

const faqs: FAQ[] = [
  { question: '¿Cómo solicito una entrevista con psicopedagogía?', answer: 'Podés solicitarla directamente a través de nuestro portal de acceso privado o en la secretaría del colegio. Los turnos de orientación se confirman en un plazo de 48 horas hábiles.' },
  { question: '¿Cuáles son los horarios del comedor?', answer: 'El comedor escolar funciona de lunes a viernes en dos turnos: de 12:00 a 13:00 para nivel inicial y primario, y de 13:00 a 14:00 para nivel secundario.' },
  { question: '¿Cómo me anoto en actividades extracurriculares?', answer: 'La inscripción se realiza de manera online durante las primeras tres semanas de cada cuatrimestre a través del portal académico.' },
  { question: '¿Quién puede solicitar tutoría de apoyo?', answer: 'Abierto a todos los estudiantes, ya sea por recomendación docente o petición directa de las familias.' },
];

export const BienestarPage: React.FC = () => {
  const [activePilar, setActivePilar] = useState<string>('Académico');

  const currentPilarData = tabsCrecimiento.find(t => t.id === activePilar) || tabsCrecimiento[0];

  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  return (
    <div className="pb-16 bg-white overflow-hidden">
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes softFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-page-fade { animation: pageFadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .animate-soft-float { animation: softFloat 3.5s infinite ease-in-out; }
      `}</style>

      <div className="animate-page-fade">
        
        <section className="bg-gradient-to-br from-edu-primary to-edu-secondary text-white py-24 px-4 text-center relative overflow-hidden">
          <img src={imagenHero} alt="" className='absolute inset-0 w-full h-full object-cover opacity-25 scale-105' />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-edu-secondary-light bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm mb-4 inline-block">Institucional</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">Bienestar Estudiantil</h1>
            <p className="text-slate-100 text-base md:text-lg opacity-95 max-w-2xl mx-auto leading-relaxed">
              Un entorno diseñado para potenciar el crecimiento humano y académico de cada estudiante.
            </p>
          </div>
        </section>

        <section className="py-16 bg-slate-50 border-b border-slate-300/50">
          <ScrollReveal delay="duration-500">
            <div className="max-w-3xl mx-auto px-4 text-center relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-200 shadow-md shadow-slate-200/80 mb-4 animate-soft-float relative group transition-all duration-300">
                <div className="absolute inset-0 rounded-full bg-edu-primary/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                <Quote className="text-edu-primary relative z-10" size={24} />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-edu-primary mb-3">Nuestro Enfoque</h2>
              <p className="text-slate-600 text-base md:text-lg italic leading-relaxed font-medium px-4">
                "Creemos que una educación de excelencia comienza en un entorno donde cada estudiante se siente acompañado, valorado y motivado a desarrollar todo su potencial académico, emocional y humano."
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-20 max-w-5xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-edu-primary bg-slate-100 px-3 py-1 rounded-full inline-block mb-3">Dimensiones</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-edu-dark tracking-tight">Crecimiento Integral</h2>
              <p className="text-slate-500 text-sm mt-2">Explorá los pilares sobre los que construimos la formación de nuestros alumnos.</p>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/60 rounded-3xl p-4 md:p-8 shadow-sm">
              <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white p-1.5 rounded-2xl max-w-2xl mx-auto border border-slate-200/60 shadow-sm">
                {tabsCrecimiento.map((tab) => {
                  const isSelected = activePilar === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePilar(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-edu-primary text-white shadow-md md:scale-105' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                      }`}
                    >
                      <span className={`transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {tab.icon}
                      </span>
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl p-6 md:p-10 shadow-md transition-all duration-500 relative overflow-hidden min-h-[200px] flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${currentPilarData.accentBg}`} />
                <div className={`p-5 rounded-2xl shrink-0 border transition-all duration-500 ${currentPilarData.colorClass}`}>
                  {React.cloneElement(currentPilarData.icon, { size: 36 })}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl font-extrabold text-edu-dark tracking-tight">
                    {currentPilarData.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">
                    {currentPilarData.desc}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-20 bg-slate-50/60 border-t border-b border-slate-300/50">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold uppercase tracking-widest text-edu-primary bg-slate-200/50 px-3 py-1 rounded-full inline-block mb-3">Cobertura</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-edu-dark tracking-tight">Áreas de Apoyo Escolar</h2>
                <p className="text-slate-500 text-sm mt-2">Programas dedicados a orientar, potenciar y acompañar el camino educativo de cada alumno.</p>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pilares.map((pilar, index) => (
                <ScrollReveal key={index} delay={`duration-[${500 + index * 100}ms]`}>
                  <div className="p-6 bg-white border border-slate-200/70 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-edu-primary/5 hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col items-start justify-between min-h-[280px] h-full">
                    <div className="w-full">
                      <div className="mb-5 p-3 bg-slate-50 text-edu-primary rounded-xl border border-slate-100 inline-block group-hover:bg-edu-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        {pilar.icon}
                      </div>
                      <h3 className="text-base font-bold text-edu-dark mb-2 tracking-tight group-hover:text-edu-primary transition-colors duration-200">{pilar.title}</h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-light mb-4">{pilar.desc}</p>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs font-bold text-edu-primary/80 group-hover:text-edu-primary border border-slate-100 bg-slate-50/50 px-3 py-2 rounded-xl transition-all duration-200 group-hover:bg-edu-primary/10 w-full justify-between mt-auto">
                      <span>Saber más</span>
                      <ArrowRight size={14} className="transform transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold uppercase tracking-widest text-edu-primary bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-full inline-block mb-3">Beneficios</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-edu-dark tracking-tight">Nuestros Servicios</h2>
                <p className="text-slate-500 text-sm mt-2">Soporte integral y recursos para garantizar la mejor experiencia escolar diaria.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio, index) => (
                <ScrollReveal key={index} delay={`duration-[${400 + (index % 3) * 100}ms]`}>
                  <div className="p-7 bg-white border border-slate-200/70 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-edu-primary/5 hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col items-start justify-between min-h-[260px] h-full">
                    <div className="w-full">
                      <div className="mb-5 p-3 bg-slate-50 text-edu-primary rounded-xl border border-slate-100 inline-block group-hover:bg-edu-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 ease-out shadow-sm">
                        {servicio.icon}
                      </div>
                      <h3 className="text-base font-bold text-edu-dark mb-2 tracking-tight group-hover:text-edu-primary transition-colors duration-200">{servicio.title}</h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-light mb-5">{servicio.desc}</p>
                    </div>

                    <button className="flex items-center gap-1.5 text-xs font-bold text-edu-primary/80 group-hover:text-edu-primary border border-slate-100 bg-slate-50/50 px-3 py-2 rounded-xl transition-all duration-200 group-hover:bg-edu-primary/10 w-full justify-between mt-auto">
                      <span>Ver detalles</span>
                      <ArrowRight size={14} className="transform transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 bg-slate-950 text-white overflow-hidden shadow-2xl">
          <img src={imagenHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay scale-110 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/60" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
            <ScrollReveal>
              <span className="w-12 h-0.5 bg-edu-accent mb-8 rounded-full opacity-75 inline-block" />
              <p className="text-xl md:text-3xl lg:text-4xl font-semibold italic max-w-3xl leading-relaxed tracking-wide text-slate-100 drop-shadow-md px-2">
                “Creemos que aprender también significa sentirse acompañado, escuchado y contenido.”
              </p>
              <span className="w-12 h-0.5 bg-edu-accent mt-8 rounded-full opacity-75 inline-block" />
            </ScrollReveal>
          </div>
        </section>

        <section className="py-20 max-w-4xl mx-auto px-4 bg-white">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-edu-dark tracking-tight">Preguntas Frecuentes</h2>
              <p className="text-slate-500 text-sm mt-1">Despejá tus dudas sobre los accesos y procesos de asistencia.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFAQIndex === index;
                return (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors duration-200">
                    <button
                      onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                      className="w-full text-left py-4 px-6 flex items-center justify-between font-bold text-sm text-edu-dark hover:bg-slate-50/40 transition-colors"
                    >
                      <span className={`${isOpen ? 'text-edu-primary' : 'text-edu-dark'} transition-colors duration-200`}>
                        {faq.question}
                      </span>
                      <div className={`p-1 rounded-full ${isOpen ? 'bg-edu-primary/10 text-edu-primary' : 'text-slate-400'} transition-all duration-200`}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] border-t border-slate-100' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <div className="px-6 py-4 text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/30">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};
