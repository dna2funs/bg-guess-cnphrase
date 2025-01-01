(function () {

const pm = {
   a: ['a', 'ā', 'á', 'ǎ', 'à'],
   o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
   e: ['e', 'ē', 'é', 'ě', 'è'],
   i: ['i', 'ī', 'í', 'ǐ', 'ì'],
   u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
   'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};
const pa = {
   b: 0, c: 0, ch: 0, d: 0, f: 0, g: 0, h: 0, j: 0, k: 0, l: 0,
   m: 0, n: 0, p: 0, q: 0, r: 0, s: 0, sh: 0, t: 0, w: 0, x: 0,
   y: 0, z: 0, zh: 0
};
const p5m = {
   a: 0,
   o: 0,
   e: 0,
   i: 0,
   u: 0,
   'ü': 0,
   an: 0,
   ang: 0,
   ao: 0,
   ai: 0,
   ong: 0,
   ou: 0,
   en: 0,
   eng: 0,
   ei: 0,
   er:0,
   in: 0,
   ing: 0,
   ia: 1,
   ian: 1,
   iang: 1,
   iao: 1,
   iong: 1,
   ie: 1,
   iu: 1,
   un: 0,
   ua: 1,
   uan: 1,
   uang: 1,
   uai: 1,
   uo: 1,
   ui: 1,
   'ün': 0,
   'üe': 1,
};

const u = {
   c: function (tag) { return document.createElement(tag); },
   t: function (txt) { return document.createTextNode(txt); },
   a: function (a, ch) { a.appendChild(ch); },
   ca: function (a, css) { a.classList.add(css); },
   cx: function (a, css) { return a.classList.contains(css); }
};

function GLayout() {
   this.dom = u.c('div');
   this.dom.classList.add('layout');
}
GLayout.prototype = {};

function pick(num, i) {
   var num = Math.floor(num / Math.pow(10, i-1));
   return num % 10;
}
function pack(num, i, x) {
   var p = pick(num, i);
   var q = Math.pow(10, i-1);
   return num - (p - x) * q;
}
function copy2(obj) {
   const r = {};
   Object.keys(obj).forEach(function (k) {
      const v = obj[k];
      if (Array.isArray(v)) {
         r[k] = v.slice();
      } else if (typeof(v) === 'object') {
         r[k] = copy2(v);
      } else {
         r[k] = v;
      }
   });
   return r;
}
function findShengdiao(ch) {
   if (!ch) return [null, -1];
   if (pm[ch]) return [ch, 0];
   var org, p5;
   const ks = Object.keys(pm);
   for (var i = 0, n = ks.length; i < n; i++) {
      p5 = pm[ks[i]].indexOf(ch);
      if (p5 >= 0) return [ks[i], p5];
   }
   return [null, -1];
}
function GenGChar(hanzi, index, flags) {
   const pinyins = window.Pinyin[hanzi];
   const pinyin = pinyins ? (pinyins[index || 0] || pinyins[0]) : '';
   var pra, prb, p5, flags;
   if (pinyin) {
      const nopa = findShengdiao(pinyin.charAt(0));
      if (nopa[1] >= 0) {
         pra = '';
         prb = pinyin;
      } else if (pinyin.substring(0, 2) in pa) {
         pra = pinyin.substring(0, 2);
         prb = pinyin.substring(2);
      } else {
         pra = pinyin.substring(0, 1);
         prb = pinyin.substring(1);
      }
      const pb1 = findShengdiao(prb.charAt(0));
      const pb2 = findShengdiao(prb.charAt(1));
      if (pb2[1] < 0) {
         const pb1 = findShengdiao(prb.charAt(0));
         if (pb1[0]) {
            prb = pb1[0] + prb.substring(1);
            p5 = pb1[1];
         } else {
            prb = '';
            p5 = -1;
         }
      } else {
         const org = pb1[0] + pb2[0] + prb.substring(2);
         const orglo = p5m[org === 'ue' ? 'üe' : org];
         prb = org;
         if (orglo) {
            p5 = pb2[1];
         } else {
            p5 = pb1[1];
         }
      }
   } else {
      pra = ''; prb = ''; p5 = -1;
   }
   return new GCharacter(hanzi, pra, prb, p5, flags);
}
function GCharacter(hanzi, pinyin_a, pinyin_b, shengdiao, flags) {
   // e.g. ch=我, pra=w, prb=o, p5=3
   this.ch = hanzi;
   this.pra = pinyin_a;
   this.prb = pinyin_b;
   if (this.prb === 'ue') {
      // if (pra === 'j' || pra === 'q' || pra === 'x' || pra === 'y') {
      this.prb = 'üe';
   }
   this.p5 = shengdiao;
   this.f = flags || 0; // 0=black,1=orange,2=blue, 0000 -> zi, pra, prb, p5
}
const flagcolors = ['black', 'full', 'half'];
GCharacter.prototype = {
   getPinyin: function() {
      if (!this.ch || (!this.pra && !this.prb)) return '?';
      var pra = this.pra;
      var prb = this.prb;
      var lo = p5m[prb];
      if (prb === 'üe') {
         if (pra === 'j' || pra === 'q' || pra === 'x' || pra === 'y') {
            prb = 'ue';
         }
      }
      return [pra, prb.substring(0, lo), pm[prb.charAt(lo)][this.p5], prb.substring(lo+1)];
   },
   buildDiv: function () {
      var div = u.c('div');
      var pdiv = u.c('div'), pxdiv;
      var zdiv = u.c('div');
      u.ca(div, 'character');
      u.ca(pdiv, 'pinyin');
      const pinyin = this.getPinyin();
      if (pinyin === '?') {
         if (this.ch) u.a(pdiv, u.t(pinyin));
      } else {
         pxdiv = u.c('div'); if (pinyin[0]) u.a(pxdiv, u.t(pinyin[0])); else pxdiv.innerHTML = '&nbsp;';
         u.ca(pxdiv, flagcolors[pick(this.f, 3)]); u.a(pdiv, pxdiv);
         const xp5 = pick(this.f, 1);
         const xb = pick(this.f, 2);
         if (xp5 === xb) {
            pxdiv = u.c('div'); u.a(pxdiv, u.t(pinyin[1]+pinyin[2]+pinyin[3])); u.ca(pxdiv, flagcolors[xb]); u.a(pdiv, pxdiv);
         } else {
            const padiv = pxdiv; u.ca(padiv, 'static');
            pxdiv = u.c('div'); u.a(pxdiv, u.t(this.prb)); u.ca(pxdiv, flagcolors[xb]); u.ca(pxdiv, 'overlap'); u.a(pdiv, pxdiv);
            u.ca(pxdiv, 'bottom');
            pxdiv = u.c('div'); u.a(pxdiv, u.t(pinyin[1]+pinyin[2]+pinyin[3])); u.ca(pxdiv, flagcolors[xp5]); u.ca(pxdiv, 'overlap'); u.a(pdiv, pxdiv);
            u.ca(pxdiv, 'p5');
            setTimeout((a, b, p) => { const ndiv = u.c('div'); ndiv.style.width = b.offsetWidth + 'px'; u.a(p, ndiv); }, 0, padiv, pxdiv, pdiv);
         }
      }
      u.ca(zdiv, 'hanzi'); u.ca(zdiv, flagcolors[pick(this.f, 4)]);
      u.a(zdiv, u.t(this.ch));
      u.a(div, pdiv);
      u.a(div, zdiv);
      return div;
   }
};

function oneShot(ph, p5idx) {
   const r = ph.split('').map(function (zi, i) {
      return GenGChar(zi, pick(p5idx, 4-i));
   });
   while (r.length < 4) r.push(GenGChar('', -1));
   return r;
}

// sample: 争先恐后, 0000
function Game(ph, p5idx) {
   this.reset(ph, p5idx);
}
Game.prototype = {
   reset: function(ph, p5idx) {
      this.ph = oneShot(ph, p5idx);
      this.stat = { ph: this.getOneStat(this.ph) };
      this.history = [];
   },
   getOneStat: function (guess) {
      const r = { a: {}, b: {}, p5: {}, zi: {} };
      guess.forEach(function (z, i) {
         if (!r.a[z.pra]) r.a[z.pra] = [];
         if (!r.b[z.prb]) r.b[z.prb] = [];
         if (!r.p5[z.p5]) r.p5[z.p5] = [];
         if (!r.zi[z.ch]) r.zi[z.ch] = [];
         r.a[z.pra].push(i);
         r.b[z.prb].push(i);
         r.p5[z.p5].push(i);
         r.zi[z.ch].push(i);
      });
      return r;
   },
   diff: function (guess) {
      // this.ph.struct == guess.struct
      const ph = this.ph;
      const g0stat = copy2(this.stat.ph);
      guess.forEach(function (z, i) {
          const z0 = ph[i];
          z.f = 0;
          if (z0.ch === z.ch) { z.f += 2000; g0stat.zi[z.ch].splice(g0stat.zi[z.ch].indexOf(i)); }
          if (z0.pra === z.pra) { z.f += 200; g0stat.a[z.pra].splice(g0stat.a[z.pra].indexOf(i)); }
          if (z0.prb === z.prb) { z.f += 20; g0stat.b[z.prb].splice(g0stat.b[z.prb].indexOf(i)); }
          if (z0.p5 === z.p5) { z.f += 2; g0stat.p5[z.p5].splice(g0stat.p5[z.p5].indexOf(i)); }
      });
      guess.forEach(function (z, i) {
          const z0 = ph[i];
          var f1 = 0, f2 = 0, f3 = 0, f4 = 0;
          if (z0.ch !== z.ch && g0stat.zi[z.ch]?.length) { z.f += 1000; g0stat.zi[z.ch].pop(); }
          if (z0.pra !== z.pra && g0stat.a[z.pra]?.length) { z.f += 100; g0stat.a[z.pra].pop(); }
          if (z0.prb !== z.prb && g0stat.b[z.prb]?.length) { z.f += 10; g0stat.b[z.prb].pop(); }
          if (z0.p5 !== z.p5 && g0stat.p5[z.p5]?.length) { z.f += 1; g0stat.p5[z.p5].pop(); }
      });
   },
   buildDom: function (guess) {
      const div = u.c('div');
      u.ca(div, 'chcontainer');
      guess.forEach(function (z) {
         const subdiv = z.buildDiv();
         u.a(div, subdiv);
      });
      return div;
   }
};

function selectPinyin(zi, env, i, ginput) {
   const idx = pick(env.p5idx, 4-i);
   const pinyins = window.Pinyin[zi];

   const div = u.c('div');
   u.ca(div, 'spcontainer');
   const sdiv = u.c('div');
   u.ca(sdiv, 'spview');
   const psel = u.c('select');
   pinyins.forEach(function (z, i) {
      const opt = u.c('option');
      opt.value = '' + i;
      u.a(opt, u.t(z));
      u.a(psel, opt);
   });
   psel.value = '' + idx;
   u.a(sdiv, psel);
   const zidiv = u.c('div');
   u.ca(zidiv, 'spzi');
   u.a(zidiv, u.t(zi));
   u.a(sdiv, zidiv);
   u.a(div, sdiv);
   u.a(document.body, div);

   div.addEventListener('click', divClick);
   psel.addEventListener('change', selChange);

   function divClick(evt) {
      if (evt.target !== div) return;
      dispose();
   }

   function selChange(evt) {
      const pidx = parseInt(evt.target.value);
      env.p5idx = pack(env.p5idx, 4-i, pidx);
      ginput.env.lastV = null;
      ginput.preview();
   }

   function dispose() {
      div.removeEventListener('click', divClick);
      psel.removeEventListener('change', selChange);
      div.parentNode.removeChild(div);
   }
}

function GInput(game, hint, opt) {
   opt = opt || {};
   this.game = game;
   this.dom = u.c('div');
   const prediv = u.c('div');
   prediv.style.display = 'none';
   u.ca(prediv, 'pre');
   u.a(this.dom, prediv);
   this.pre = prediv;
   const div = u.c('div');
   u.ca(div, 'input-container');
   this.input = u.c('input');
   this.btn = u.c('button');
   u.a(this.btn, u.t('提交'));
   u.a(div, this.input);
   u.a(div, this.btn);
   u.a(this.dom, div);

   const env = {
      skip: false,
      p5idx: 0,
      lastV: '',
      v: '',
   };
   const that = this;
   this.env = env;
   this.input.addEventListener('compositionstart', function (evt) {
      env.skip = true;
   });
   this.input.addEventListener('compositionend', function (evt) {
      env.skip = false;
      evt.target.value = evt.target.value.substring(0, 4);
      env.v = evt.target.value;
      env.p5idx = 0;
      that.preview();
   });
   this.input.addEventListener('input', function (evt) {
      if (env.skip) return;
      evt.target.value = evt.target.value.substring(0, 4);
      env.v = evt.target.value;
      env.p5idx = 0;
      that.preview();
   });

   this.btn.addEventListener('click', function (evt) {
      if (opt.onSubmit && opt.onSubmit(env.v, env.p5idx)) {
         that.input.value = '';
         that.env.v = '';
         that.preview();
         that.input.focus();
         hint.update();
      }
   });

   this.pre.addEventListener('click', function (evt) {
      var t = evt.target;
      if (u.cx(t, 'chcontainer') || u.cx(t, 'pre')) return;
      while (!u.cx(t, 'character')) t = t.parentNode;
      const zi = t.children[1].textContent.trim();
      var i = 0, n = t.parentNode.children.length;
      for (; i < n; i++) if (t.parentNode.children[i] === t) break;
      if (i === n) return;
      const pinyins = window.Pinyin[zi] || [];
      if (pinyins.length <= 1) return;
      selectPinyin(zi, env, i, that);
   });
}
GInput.prototype = {
   preview: function () {
      if (this.env.v === this.env.lastV) return;
      this.env.lastV = this.env.v;
      if (this.env.v) {
         const guess = oneShot(this.env.v, this.env.p5idx);
         this.pre.innerHTML = '';
         u.a(this.pre, this.game.buildDom(guess));
         this.pre.style.display = 'flex';
      } else {
         this.pre.style.display = 'none';
      }
   }
};

function GHint(game) {
   this.game = game;
   const env = {
      show: false
   };
   this.env = env;
   this.dom = u.c('div');
   const view = u.c('div');
   view.style.display = 'none';
   this.view = view;
   u.a(this.dom, view);

   const btn = u.c('div');
   u.ca(btn, 'hintbtn');
   u.a(btn, u.t('^'));
   u.a(this.dom, btn);

   const that = this;
   btn.addEventListener('click', function () {
      btn.innerHTML = '';
      if (env.show) {
         u.a(btn, u.t('^'));
         view.innerHTML = '';
         view.style.display = 'none';
         env.show = false;
      } else {
         u.a(btn, u.t('v'));
         view.style.display = 'block';
         env.show = true;
         that.update();
      }
   });
}
GHint.prototype = {
   update: function () {
      const env = this.env;
      env.pa = Object.assign({}, pa);
      env.p5m = {}; Object.keys(p5m).forEach(function (z) { env.p5m[z] = 0; });

      const stat = this.game.stat.ph;
      const one0 = this.game.ph;
      this.view.innerHTML = '';
      this.game.history.forEach(function (one) {
         one.forEach(function (z, i) {
            if (one0[i].pra === z.pra) {
               env.pa[z.pra] = 2;
            } else if (z.pra in stat.a) {
               if (env.pa[z.pra] <= 0) env.pa[z.pra] = 1;
            } else {
               if (env.pa[z.pra] === 0) env.pa[z.pra] = -1;
            }
            if (one0[i].prb === z.prb) {
               env.p5m[z.prb] = 2;
            } else if (z.prb in stat.b) {
               if (env.p5m[z.prb] <= 0) env.p5m[z.prb] = 1;
            } else {
               if (env.p5m[z.prb] === 0) env.p5m[z.prb] = -1;
            }
         });
      });

      var div;
      div = u.c('div'); u.a(div, u.t('辅音')); u.a(this.view, div);
      div = u.c('div');
      Object.keys(env.pa).forEach(function (k) {
         const span = u.c('span');
         u.ca(span, 'hinta');
         u.ca(span, buColor(env.pa[k]));
         u.a(span, u.t(k)); u.a(div, span);
      });
      u.a(this.view, div);
      div = u.c('div'); u.a(div, u.t('元音')); u.a(this.view, div);
      div = u.c('div');
      Object.keys(env.p5m).forEach(function (k) {
         const span = u.c('span');
         u.ca(span, 'hinta');
         u.ca(span, buColor(env.p5m[k]));
         u.a(span, u.t(k)); u.a(div, span);
      });
      u.a(this.view, div);

      function buColor(n) {
         switch(n) {
         case -1: return 'gray';
         case 1: return 'orange';
         case 2: return 'blue';
         default: return 'black';
         }
      }
   }
};

function init() {
   const dayts = 1000 * 24 * 3600;
   const cnpn = window.CNPhrase.length;
   const ts = new Date();
   const cnp = window.CNPhrase[Math.floor(ts.getTime() / dayts) % cnpn];

   const layout = new GLayout();
   const game = new Game(cnp.a, cnp.p || 0);
   const phdiv = u.c('div');
   u.ca(phdiv, 'phview');
   u.a(layout.dom, phdiv);

   const statdiv = u.c('div');
   const hint = new GHint(game);
   u.a(statdiv, hint.dom);
   const input = new GInput(game, hint, {
      onSubmit: function (ph, p5idx) {
         phdiv.innerHTML = '';
         const guess = oneShot(ph, p5idx);
         if (guess.reduce(function (a, z) {
            if (!z.ch) return a+1;
            if (!z.pra && !z.prb) return a+1;
            if (z.p5 < 0) return a+1;
            return a;
         }, 0) > 0) return false;
         game.diff(guess);
         game.history.push(guess);
         game.history.forEach(function (z) {
            u.a(phdiv, game.buildDom(z));
         });
         return true;
      }
   });
   u.a(statdiv, input.dom);
   u.a(layout.dom, statdiv);

   u.a(document.body, layout.dom);
}

init();

})();
