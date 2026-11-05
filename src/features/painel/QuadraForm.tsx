import { useState, type FormEvent } from 'react'
import { erroDoCampo } from '../../core/api/erros.ts'
import { Link } from '../../core/Link'
import { criarQuadra, editarQuadra, type Esporte, type Local, type Quadra } from './api.ts'
import { Campo } from './Campo'
import { mensagemDoErro } from './erros.ts'
import { lerValor, nomeDoEsporte, textoDoValor } from './formato.ts'
import { daApi, paraApi, problemaDoDia, type GradeDaSemana } from './grade.ts'
import { GradeSemanal } from './GradeSemanal'

const ESPORTES: Esporte[] = ['FUTEBOL', 'VOLEI', 'FUTEVOLEI']
const DURACOES = [60, 90, 120]

type Erros = { nome?: string; esportes?: string; duracao?: string; valor?: string; grade?: string; geral?: string }

type Props = { local: Local; quadra?: Quadra; aoSalvar: () => void }

export function QuadraForm({ local, quadra, aoSalvar }: Props) {
  const [nome, setNome] = useState(quadra?.nome ?? '')
  const [esportes, setEsportes] = useState<Esporte[]>(quadra?.esportes ?? [])
  const [duracao, setDuracao] = useState(quadra?.duracaoMinutos ?? 60)
  const [valor, setValor] = useState(quadra?.valorHoraCentavos ? textoDoValor(quadra.valorHoraCentavos) : '')
  const [grade, setGrade] = useState<GradeDaSemana>(() => daApi(quadra?.grade ?? []))
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)

  function alternarEsporte(esporte: Esporte, marcado: boolean) {
    setEsportes((atuais) => (marcado ? [...atuais, esporte] : atuais.filter((e) => e !== esporte)))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nomeLimpo = nome.trim()
    const valorLido = lerValor(valor)
    const novos: Erros = {}
    if (nomeLimpo.length < 1 || nomeLimpo.length > 25) novos.nome = 'Use de 1 a 25 caracteres.'
    if (esportes.length === 0) novos.esportes = 'Escolha ao menos um esporte.'
    if ('erro' in valorLido) novos.valor = valorLido.erro
    if (grade.some((dia) => problemaDoDia(dia))) novos.grade = 'Corrija os horários marcados em vermelho.'
    setErros(novos)
    if (Object.keys(novos).length > 0 || 'erro' in valorLido) return

    setEnviando(true)
    const dados = {
      nome: nomeLimpo,
      esportes: ESPORTES.filter((esporte) => esportes.includes(esporte)),
      duracaoMinutos: duracao,
      valorHoraCentavos: valorLido.centavos,
      grade: paraApi(grade),
    }
    try {
      if (quadra) await editarQuadra(local.id, quadra.id, dados)
      else await criarQuadra(local.id, dados)
      aoSalvar()
    } catch (err) {
      const doServidor: Erros = {
        nome: erroDoCampo(err, 'nome'),
        esportes: erroDoCampo(err, 'esportes'),
        duracao: erroDoCampo(err, 'duracaoMinutos'),
        valor: erroDoCampo(err, 'valorHoraCentavos'),
        grade: erroDoCampo(err, 'grade'),
      }
      if (!Object.values(doServidor).some(Boolean)) doServidor.geral = mensagemDoErro(err)
      setErros(doServidor)
      setEnviando(false)
    }
  }

  return (
    <>
      <h1>{quadra ? 'Editar quadra' : 'Nova quadra'} · {local.nome}</h1>
      <form onSubmit={enviar} noValidate>
        <Campo id="quadra-nome" rotulo="Nome" valor={nome} aoMudar={setNome} erro={erros.nome} maxLength={25} />
        <fieldset aria-describedby={erros.esportes ? 'quadra-esportes-erro' : undefined}>
          <legend>Esportes</legend>
          {ESPORTES.map((esporte) => (
            <label key={esporte} className="opcao">
              <input
                type="checkbox"
                checked={esportes.includes(esporte)}
                onChange={(e) => alternarEsporte(esporte, e.target.checked)}
              />
              {nomeDoEsporte(esporte)}
            </label>
          ))}
          {erros.esportes && <span id="quadra-esportes-erro" className="erro">{erros.esportes}</span>}
        </fieldset>
        <fieldset>
          <legend>Duração do horário</legend>
          {DURACOES.map((minutos) => (
            <label key={minutos} className="opcao">
              <input type="radio" name="duracao" checked={duracao === minutos} onChange={() => setDuracao(minutos)} />
              {minutos} min
            </label>
          ))}
          {erros.duracao && <span className="erro">{erros.duracao}</span>}
        </fieldset>
        <Campo
          id="quadra-valor"
          rotulo="Valor por hora (opcional)"
          valor={valor}
          aoMudar={setValor}
          erro={erros.valor}
          ajuda="Só informativo: o pagamento é combinado com a quadra."
          inputMode="decimal"
          placeholder="120,00"
        />
        <GradeSemanal grade={grade} duracao={duracao} aoMudar={setGrade} erro={erros.grade} />
        {quadra && <p className="ajuda">Mudar a grade não cancela as reservas marcadas.</p>}
        {erros.geral && <p className="erro" role="alert">{erros.geral}</p>}
        <div className="acoes">
          <button type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
          <Link para="/painel">Cancelar</Link>
        </div>
      </form>
    </>
  )
}
