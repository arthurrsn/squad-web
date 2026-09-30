// Conveniência de UX: a regra de verdade é do servidor (8 a 64 caracteres, até 72 bytes por causa do bcrypt).
export function validarNovaSenha(senha: string, repetida: string): { senha?: string; repetida?: string } {
  if (senha.length < 8 || senha.length > 64) return { senha: 'A senha deve ter de 8 a 64 caracteres.' }
  if (new TextEncoder().encode(senha).length > 72) {
    return { senha: 'Senha longa demais. Use menos caracteres ou evite acentos e emojis.' }
  }
  if (senha !== repetida) return { repetida: 'As senhas não são iguais.' }
  return {}
}
