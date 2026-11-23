import { useState, type FormEvent } from 'react'
import { DURACOES, MOTIVOS, textoDaSuspensao, textoDoBanimento, type DadosDaPunicao } from './contas.ts'
import { PARTES, rotuloDoMotivo, type Parte } from './fila.ts'

type PartesProps = { id: string; partes: Parte[]; aoMudar: (partes: Parte[]) => void; desligado: boolean }

/** As partes do perfil que saem: no Remover e no Suspender do cartão de perfil. */
export function PartesDoPerfil({ id, partes, aoMudar, desligado }: PartesProps) {
  function trocar(parte: Parte, marcada: boolean) {
    aoMudar(marcada ? [...partes, parte] : partes.filter((p) => p !== parte))
  }
  return (
    <fieldset>
      <legend>O que sai do perfil?</legend>
      {PARTES.map(({ parte, rotulo }) => (
        <label key={parte} className="opcao" htmlFor={`${id}-${parte}`}>
          <input
            id={`${id}-${parte}`}
            type="checkbox"
            checked={partes.includes(parte)}
            onChange={(e) => trocar(parte, e.target.checked)}
            disabled={desligado}
          />
          {rotulo}
        </label>
      ))}
    </fieldset>
  )
}

type PunirProps = {
  id: string
  tipo: 'suspender' | 'banir'
  arroba: string | null
  /** No cartão da fila: a confirmação diz que o conteúdo sai, e o perfil pede as partes. */
  peloCartao?: { perfil: boolean }
  enviando: boolean
  aoConfirmar: (dados: DadosDaPunicao) => void
  aoVoltar: () => void
}

export function Punir({ id, tipo, arroba, peloCartao, enviando, aoConfirmar, aoVoltar }: PunirProps) {
  const [dias, setDias] = useState(7)
  const [motivo, setMotivo] = useState('')
  const [nota, setNota] = useState('')
  const [partes, setPartes] = useState<Parte[]>(['BIO_E_FOTO'])
  const [erro, setErro] = useState<string>()
  // A data de volta mostrada parte de quando o formulário abriu; a que vale é a do servidor.
  const [abertoEm] = useState(() => new Date())
  const comPartes = tipo === 'suspender' && peloCartao?.perfil === true

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!motivo) {
      setErro('Escolha um motivo.')
      return
    }
    if (comPartes && partes.length === 0) {
      setErro('Marque o que sai do perfil.')
      return
    }
    setErro(undefined)
    aoConfirmar({ dias, motivo, nota, partes })
  }

  return (
    <form onSubmit={enviar} noValidate>
      {tipo === 'suspender' && (
        <fieldset>
          <legend>Por quanto tempo?</legend>
          {DURACOES.map((d) => (
            <label key={d} className="opcao" htmlFor={`${id}-dias-${d}`}>
              <input
                id={`${id}-dias-${d}`}
                type="radio"
                name={`${id}-dias`}
                checked={dias === d}
                onChange={() => setDias(d)}
                disabled={enviando}
              />
              {d === 1 ? '1 dia' : `${d} dias`}
            </label>
          ))}
        </fieldset>
      )}
      <label htmlFor={`${id}-motivo`}>
        Motivo
        <select id={`${id}-motivo`} value={motivo} onChange={(e) => setMotivo(e.target.value)} disabled={enviando}>
          <option value="">Escolha</option>
          {MOTIVOS.map((m) => (
            <option key={m} value={m}>{rotuloDoMotivo(m)}</option>
          ))}
        </select>
      </label>
      <label htmlFor={`${id}-nota`}>
        Nota para a equipe (opcional)
        <textarea
          id={`${id}-nota`}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={enviando}
        />
      </label>
      {comPartes && <PartesDoPerfil id={`${id}-partes`} partes={partes} aoMudar={setPartes} desligado={enviando} />}
      <p>
        {tipo === 'suspender' ? textoDaSuspensao(arroba, dias, abertoEm, !!peloCartao) : textoDoBanimento(arroba)}
      </p>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="acoes">
        <button type="submit" className="perigo" disabled={enviando}>
          {tipo === 'suspender' ? (enviando ? 'Suspendendo…' : 'Suspender') : enviando ? 'Banindo…' : 'Banir'}
        </button>
        <button type="button" onClick={aoVoltar} disabled={enviando}>Voltar</button>
      </div>
    </form>
  )
}
