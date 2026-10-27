import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import lifeInicial from '../../../assets/service/life-inicial.png';
import lifePrimario from '../../../assets/service/life-primario.png';
import lifeSecundario from '../../../assets/service/life-secundario.png';
import lifeDeportes from '../../../assets/service/life-deportes.png';

const cardItems = [
  {
    id: 'inicial',
    title: 'Inicial',
    subtitle: 'Juego y Exploracion',
    desc: 'Iniciamos el aprendizaje estimulando la curiosidad natural a traves de la socializacion creativa.',
    img: lifeInicial,
  },
  {
    id: 'primario',
    title: 'Primaria',
    subtitle: 'Habilidades Fundamentales',
    desc: 'Formamos las bases academicas solidas con ingles intensivo, artes y valores esenciales.',
    img: lifePrimario,
  },
  {
    id: 'secundario',
    title: 'Secundaria',
    subtitle: 'Tecnologia y Futuro',
    desc: 'Preparacion de excelencia enfocada en IT, economia y competencias para el siglo XXI.',
    img: lifeSecundario,
  },
  {
    id: 'deportes',
    title: 'Vida Activa',
    subtitle: 'Deporte y Disciplina',
    desc: 'Potenciamos la salud fisica, el trabajo en equipo y el liderazgo en el campo de juego.',
    img: lifeDeportes,
  },
];

export const FluidStackSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center overflow-hidden px-4 pb-10 pt-6">
      <div className="mx-auto mb-12 w-full max-w-4xl border-t border-slate-300/50" />

      <div className="mb-12 max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-edu-dark md:text-5xl">
          Vida Estudiantil
        </h2>
        <p className="text-lg leading-relaxed text-slate-600 md:text-xl">
          La inspiracion, el aprendizaje y la innovacion se unen en nuestro campus,
          creando el ecosistema perfecto para formar a los lideres del manana.
        </p>
      </div>

      <div className="mb-12 hidden h-[450px] w-full gap-3 md:flex">
        {cardItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const flexValue = isExpanded ? '3' : expandedId === null ? '1' : '0.5';

          return (
            <div
              key={item.id}
              onMouseEnter={() => setExpandedId(item.id)}
              onMouseLeave={() => setExpandedId(null)}
              style={{ flex: flexValue }}
              className="group relative h-full cursor-pointer overflow-hidden rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-white">
                <h3
                  className={`font-bold leading-tight tracking-tight transition-all duration-300 ${
                    isExpanded ? 'mb-2 text-4xl' : 'mb-0 text-xl'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`font-medium text-edu-accent transition-opacity duration-300 ${
                    isExpanded ? 'opacity-100' : 'h-0 overflow-hidden opacity-0'
                  }`}
                >
                  {item.subtitle}
                </p>
                <p
                  className={`mt-4 max-w-md text-white/90 transition-all duration-300 ${
                    isExpanded
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none h-0 translate-y-2 overflow-hidden opacity-0'
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-10 flex w-full flex-col gap-4 md:hidden">
        {cardItems.map((item) => (
          <div key={item.id} className="relative h-64 overflow-hidden rounded-xl">
            <img src={item.img} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-white/90">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/niveles"
        className="inline-flex transform items-center gap-2 rounded-full bg-edu-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-edu-primary/20 transition-all hover:-translate-y-0.5 hover:bg-edu-secondary hover:shadow-xl"
      >
        <span>Descubrelo</span>
        <ArrowRight size={20} />
      </Link>
    </section>
  );
};
