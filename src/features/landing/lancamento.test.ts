import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  LINK_ANDROID, LINK_IPHONE, MENSAGEM_DO_DONO, WHATSAPP_DA_EQUIPE, linkDoWhatsApp, numeroValido,
} from './lancamento.ts'

test('sem número, não há link do WhatsApp', () => {
  assert.equal(linkDoWhatsApp(null, MENSAGEM_DO_DONO), null)
})

test('o link do WhatsApp leva a mensagem codificada', () => {
  assert.equal(
    linkDoWhatsApp('5500000000000', 'Olá! Tenho uma quadra & horário'),
    'https://wa.me/5500000000000?text=Ol%C3%A1!%20Tenho%20uma%20quadra%20%26%20hor%C3%A1rio',
  )
})

test('o número é só dígitos, com o 55 e o DDD', () => {
  assert.equal(numeroValido('5500000000000'), true)
  assert.equal(numeroValido('550000000000'), true)
  assert.equal(numeroValido('+5500000000000'), false)
  assert.equal(numeroValido('55 00 00000-0000'), false)
  assert.equal(numeroValido('00000000000'), false)
  assert.equal(numeroValido('55000000000000'), false)
  assert.equal(linkDoWhatsApp('(00) 00000-0000', MENSAGEM_DO_DONO), null)
})

test('a configuração do lançamento está no formato certo', () => {
  assert.ok(WHATSAPP_DA_EQUIPE === null || numeroValido(WHATSAPP_DA_EQUIPE))
  assert.ok(LINK_ANDROID === null || LINK_ANDROID.startsWith('https://play.google.com/'))
  assert.ok(LINK_IPHONE === null || LINK_IPHONE.startsWith('https://apps.apple.com/'))
})
