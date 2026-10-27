import assert from 'node:assert/strict';
import { test } from 'node:test';
import { educationalLevelLabel } from '../src/shared/utils/educationalLevelLabel.ts';

test('muestra los niveles conocidos en español sin alterar nombres personalizados', () => {
  for (const [input, expected] of [
    ['initial', 'Inicial'], ['Inicial', 'Inicial'],
    ['primary', 'Primaria'], ['Primario', 'Primaria'], ['Primaria', 'Primaria'],
    ['secondary', 'Secundaria'], ['Secundario', 'Secundaria'], ['Secundaria', 'Secundaria'],
    ['Educación especial', 'Educación especial'],
  ]) assert.equal(educationalLevelLabel(input), expected);
  assert.equal(educationalLevelLabel(null), null);
});
