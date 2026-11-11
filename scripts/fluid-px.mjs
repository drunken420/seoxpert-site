// Big-screen scaling, part 1 of 2 (part 2 is the `html{font-size}` rule in src/styles/global.css).
//
// The styles are written in px. At build time this turns every px size into the same size in rem
// (16px = 1rem), so the whole page follows the root font size. Up to 1920px wide the root stays 16px
// and nothing changes. On wider screens the root grows with the screen, and the page grows with it.
//
// Left alone on purpose: @media conditions (breakpoints stay in real px) and the root font size itself.
const PX = /(\d*\.?\d+)px\b/g;
const toRem = (m, n) => (Number(n) === 0 ? '0' : +(Number(n) / 16).toFixed(5) + 'rem');

/** Convert the px sizes in one CSS value (or inline style) to rem. Text inside url(...) and quotes is kept. */
export function pxToRem(value) {
  return value
    .split(/(url\([^)]*\)|"[^"]*"|'[^']*')/)
    .map((part, i) => (i % 2 ? part : part.replace(PX, toRem)))
    .join('');
}

export default function fluidPx() {
  return {
    postcssPlugin: 'fluid-px',
    Declaration(decl) {
      if (!decl.value.includes('px')) return;
      const rule = decl.parent;
      if (decl.prop === 'font-size' && rule && rule.type === 'rule' && rule.selector === 'html') return;
      decl.value = pxToRem(decl.value);
    },
  };
}
fluidPx.postcss = true;
