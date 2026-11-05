import {
  DIAS,
  FIM_DO_DIA,
  MAX_PERIODOS,
  hora,
  opcoesDeHora,
  periodoNovo,
  previaDoDia,
  problemaDoDia,
  type GradeDaSemana,
  type Periodo,
} from './grade.ts'

type Props = { grade: GradeDaSemana; duracao: number; aoMudar: (grade: GradeDaSemana) => void; erro?: string }

export function GradeSemanal({ grade, duracao, aoMudar, erro }: Props) {
  function mudarDia(i: number, dia: Periodo[]) {
    aoMudar(grade.map((atual, j) => (j === i ? dia : atual)))
  }

  function usarEmTodos(i: number) {
    aoMudar(grade.map(() => grade[i].map((periodo) => ({ ...periodo }))))
  }

  return (
    <fieldset className="grade">
      <legend>Horários de funcionamento</legend>
      {erro && <span className="erro" role="alert">{erro}</span>}
      {grade.map((dia, i) => {
        const problema = problemaDoDia(dia)
        return (
          <fieldset key={DIAS[i]} className="dia">
            <legend>{DIAS[i]}</legend>
            {dia.length === 0 && <p>Fechado</p>}
            {dia.map((periodo, j) => (
              <div key={j} className="periodo">
                <SeletorDeHora
                  id={`abre-${i}-${j}`}
                  rotulo="Abre"
                  valor={periodo.abre}
                  de={0}
                  ate={FIM_DO_DIA - 30}
                  aoMudar={(abre) => mudarDia(i, dia.map((p, k) => (k === j ? { ...p, abre } : p)))}
                />
                <SeletorDeHora
                  id={`fecha-${i}-${j}`}
                  rotulo="Fecha"
                  valor={periodo.fecha}
                  de={30}
                  ate={FIM_DO_DIA}
                  aoMudar={(fecha) => mudarDia(i, dia.map((p, k) => (k === j ? { ...p, fecha } : p)))}
                />
                <button
                  type="button"
                  onClick={() => mudarDia(i, dia.filter((_, k) => k !== j))}
                  aria-label={`Remover o período das ${hora(periodo.abre)} às ${hora(periodo.fecha)} de ${DIAS[i]}`}
                >
                  Remover
                </button>
              </div>
            ))}
            {problema ? (
              <p className="erro">{problema}</p>
            ) : (
              previaDoDia(dia, duracao).map((linha) => <p key={linha} className="ajuda">{linha}</p>)
            )}
            <div className="acoes">
              <button
                type="button"
                disabled={dia.length >= MAX_PERIODOS}
                onClick={() => mudarDia(i, [...dia, periodoNovo(dia)])}
              >
                Adicionar período
              </button>
              {dia.length > 0 && (
                <button type="button" onClick={() => usarEmTodos(i)}>Usar em todos os dias</button>
              )}
            </div>
          </fieldset>
        )
      })}
    </fieldset>
  )
}

type SeletorProps = { id: string; rotulo: string; valor: number; de: number; ate: number; aoMudar: (valor: number) => void }

function SeletorDeHora({ id, rotulo, valor, de, ate, aoMudar }: SeletorProps) {
  return (
    <label htmlFor={id}>
      {rotulo}
      <select id={id} value={valor} onChange={(e) => aoMudar(Number(e.target.value))}>
        {opcoesDeHora(de, ate, valor).map((minutos) => (
          <option key={minutos} value={minutos}>{hora(minutos)}</option>
        ))}
      </select>
    </label>
  )
}
