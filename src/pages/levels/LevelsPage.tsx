import React from 'react';
import { Baby, BookOpen, GraduationCap, Clock, Globe, Laptop, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeInSection } from '../../shared/components/FadeInSection';
import imagenHero from '../../assets/service/hero-niveles-educativos.png';

export const LevelsPage: React.FC = () => {
  // 1. Datos de los Niveles Educativos (Alineado con los requerimientos de Jornada Extendida del TP1)
  const levels = [
    {
      icon: <Baby size={30} className="text-edu-primary" />,
      title: 'Inicial',
      chip: 'Salas 3, 4 y 5 años - Jornada Extendida',
      desc: 'Centrado en el aprendizaje a través del juego, la estimulación integral y la libre exploración en modalidad de jornada extendida. Promovemos los primeros pasos firmes en la socialización y el autoconocimiento con docentes especializadas en primera infancia.',
      bg: 'bg-[#D6EAF8]/60',
      imgUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80'
    },
    {
      icon: <BookOpen size={30} className="text-[#166534]" />,
      title: 'Primaria',
      chip: '1° a 6° grado - Jornada Extendida',
      desc: 'Garantiza el desarrollo consolidado de competencias en lectoescritura, cálculo científico y pensamiento lógico. Incorpora talleres complementarios de informática y robótica educativa, además del inicio formal de la grilla de idiomas plurilingües.',
      bg: 'bg-[#DCFCE7]/60',
      imgUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80'
    },
    {
      icon: <GraduationCap size={30} className="text-[#92400E]" />,
      title: 'Secundaria',
      chip: '1° a 5° año - Jornada Extendida',
      desc: 'Ofrece orientaciones validadas en Economía e Informática. Cuenta con laboratorios tecnológicos avanzados y talleres de desarrollo de software prácticos, articulando de manera de excelencia el traspaso hacia el ámbito universitario y profesional.',
      bg: 'bg-[#FEF3C7]/60',
      imgUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
    },
  ];

  // 2. Datos de los Pilares (Se cambiaron los links por unos más estables de Unsplash)
  const highlights = [
    { 
      icon: <Globe size={26} className="text-white" />, 
      label: 'Programa Plurilingüe', 
      desc: 'Formación curricular intensiva dictada obligatoriamente en tres lenguas clave: Inglés, Portugués y Francés.',
      imgUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'
    },
    { 
      icon: <Laptop size={26} className="text-white" />, 
      label: 'Complejo Científico-Tecnológico', 
      desc: 'Laboratorios de vanguardia completamente equipados para las asignaturas prácticas de Computación, Física y Química.',
      imgUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80'
    },
    { 
      icon: <Clock size={26} className="text-white" />, 
      label: 'Logística e Infraestructura', 
      desc: 'Acceso a un comedor institucional controlado, servicio interno de enfermería y sistema regulado de micros de traslado.',
      imgUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
      
      {/* SECCIÓN 1: HERO */}
      <FadeInSection direction="none" duration={0.8}>
        <section className="bg-gradient-to-br from-edu-primary to-edu-secondary text-white py-28 px-4 text-center relative overflow-hidden">
          <img src={imagenHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-edu-primary/40" />
          <div className="max-w-4xl mx-auto relative z-10 space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-edu-secondary-light bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-sm inline-block">
              Propuesta Académica
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-xs">
              Niveles Educativos
            </h1>
            <p className="text-slate-100 text-base md:text-lg max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
              Acompañamos a tus hijos en cada etapa de su desarrollo con una formación integral, innovadora y de alta calidad humana.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* SECCIÓN 2: GRID DE LA OFERTA ACADÉMICA */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-edu-secondary bg-edu-secondary/10 px-3 py-1 rounded-md">
            Trayecto Escolar
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 pb-3 border-b border-slate-200">
            Nuestra Oferta Académica
          </h2>
        </div>

        <div className="space-y-14">
          {levels.map((level, index) => {
            const isEven = index % 2 === 0;
            return (
              <FadeInSection key={index} direction={isEven ? 'left' : 'right'}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200/60 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 items-center gap-0 md:gap-4">
                  
                  {/* Bloque de Imagen del Nivel */}
                  <div className={`col-span-1 md:col-span-5 h-64 md:h-full min-h-[260px] relative ${!isEven ? 'md:order-last' : ''}`}>
                    <img 
                      src={level.imgUrl} 
                      alt={level.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>

                  {/* Bloque de Texto e Iconos */}
                  <div className="col-span-1 md:col-span-7 p-8 md:p-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl ${level.bg} flex items-center justify-center shadow-2xs`}>
                        {level.icon}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-edu-primary tracking-tight">
                          {level.title}
                        </h3>
                        <span className="inline-block bg-slate-100 text-edu-secondary border border-slate-200 rounded-full px-3 py-0.5 text-[11px] font-bold mt-1 shadow-3xs">
                          {level.chip}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal">
                      {level.desc}
                    </p>
                  </div>

                </div>
              </FadeInSection>
            );
          })}
        </div>

        {/* SECCIÓN 3: PILARES DE FORMACIÓN (Corregido: Letra más grande y links estables) */}
        <div className="mt-28 pt-16 border-t border-slate-300/50">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-edu-secondary bg-edu-secondary/10 px-3 py-1 rounded-md">
              Diferenciales
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Pilares de Formación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <FadeInSection key={index} direction="up" duration={0.4 + index * 0.1}>
                <div className="relative group rounded-3xl overflow-hidden h-80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col justify-end p-6">
                  
                  {/* Foto de fondo */}
                  <img 
                    src={item.imgUrl} 
                    alt={item.label} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Capa de degradado oscuro equilibrada */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/40 transition-opacity duration-300 group-hover:opacity-95" />

                  {/* Contenido */}
                  <div className="relative z-10 space-y-3 text-left">
                    
                    {/* Icono */}
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center shadow-3xs transition-colors duration-300 group-hover:bg-edu-secondary/20 group-hover:border-edu-secondary/40">
                      {item.icon}
                    </div>
                    
                    <div className="space-y-1">
                      <span className="block text-md md:text-lg font-bold text-white tracking-tight">
                        {item.label}
                      </span>
                      {/* Aumentado de text-[11px] a text-xs/text-sm con mejor contraste */}
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal group-hover:text-white transition-colors duration-200">
                        {item.desc}
                      </p>
                    </div>

                  </div>

                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: BANNER CTA */}
      <FadeInSection direction="none">
        <section className="bg-gradient-to-br from-edu-primary to-slate-900 text-white py-20 px-4 text-center border-t border-white/5 shadow-inner">
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">¿Querés formar parte de nuestra comunidad?</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto font-medium">
              Iniciá el proceso de inscripción en línea para el ciclo lectivo 2027 de forma rápida y sencilla.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-sm mx-auto sm:max-w-none">
              <Link
                to="/inscripcion"
                className="inline-flex items-center justify-center gap-2 bg-white text-edu-primary hover:bg-slate-50 font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                <span>SOLICITAR INSCRIPCIÓN</span>
                <ArrowRight size={15} className="stroke-[3]" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center bg-transparent text-slate-200 hover:text-white border border-slate-700 hover:border-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all duration-200"
              >
                <span>CONTACTAR</span>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

    </div>
  );
};
