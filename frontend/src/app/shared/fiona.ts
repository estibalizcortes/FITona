import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type FionaPose =
  | 'greeting'
  | 'cooking'
  | 'working'
  | 'sport'
  | 'saving'
  | 'care'
  | 'celebrating'
  | 'resting'
  | 'thinking'
  | 'waiting'
  | 'waking';

type Eyes = 'open' | 'happy' | 'closed' | 'sleepy' | 'up' | 'side';
const EYES: Record<FionaPose, Eyes> = {
  greeting: 'open',
  cooking: 'open',
  working: 'open',
  sport: 'open',
  saving: 'happy',
  care: 'closed',
  celebrating: 'happy',
  resting: 'closed',
  thinking: 'up',
  waiting: 'side',
  waking: 'sleepy',
};

/**
 * Fiona, la mascota de FITona: un Pionus senilis (cabeza azul con frente y garganta blancas, cuerpo verde, plumas rojas bajo la cola).
 * Un único dibujo SVG (mismo personaje, colores y proporciones) con accesorios y gestos por pose. Solo SVG + CSS: sin imágenes ni JS.
 * Base de «Mi Fiona»: la personalización futura (colores, accesorios) cambiará las variables --fiona-* y los accesorios.
 */
@Component({
  selector: 'app-fiona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size() * 1.07"
      viewBox="0 0 140 150"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
      focusable="false"
      [class]="'f-' + pose()"
    >
      <ellipse cx="70" cy="143" rx="30" ry="4.5" fill="#2d2a3e" opacity=".08" />
      <g class="body">
        <!-- cola con las plumas rojas características -->
        <path d="M58 110 L50 140 L66 130 L74 142 L84 110Z" fill="var(--fiona-wing, #4c9a2a)" />
        <path d="M54 130 L50 140 L62 133Z" fill="#e5484d" />
        <!-- patas -->
        <ellipse cx="58" cy="124" rx="8" ry="3.6" fill="#ffad76" />
        <ellipse cx="82" cy="124" rx="8" ry="3.6" fill="#ffad76" />
        <!-- cuerpo y vientre -->
        <ellipse cx="70" cy="90" rx="37" ry="35" fill="var(--fiona-body, #7bc742)" />
        <ellipse cx="70" cy="99" rx="22" ry="24" fill="var(--fiona-belly, #b8ea86)" />
        <!-- alas -->
        <g class="wing-l" [attr.transform]="wingL()">
          <ellipse cx="38" cy="92" rx="11" ry="24" fill="var(--fiona-wing, #5fb02f)" />
        </g>
        <g class="wing-r" [attr.transform]="wingR()">
          <g class="wing-anim">
            <ellipse cx="102" cy="92" rx="11" ry="24" fill="var(--fiona-wing, #5fb02f)" />
          </g>
        </g>
      </g>

      <!-- cabeza -->
      <g class="head">
        <circle cx="70" cy="50" r="30" fill="var(--fiona-head, #4b84da)" />
        <path d="M54 33 Q70 20 86 33 Q70 44 54 33Z" fill="#fff" />
        <ellipse cx="70" cy="68" rx="15" ry="7.5" fill="#f7f2f5" />
        <circle cx="45" cy="62" r="5.5" fill="#f58eb3" opacity=".55" />
        <circle cx="95" cy="62" r="5.5" fill="#f58eb3" opacity=".55" />

        @switch (eyes()) {
          @case ('happy') {
            <path
              d="M48 52 Q57 41 66 52"
              stroke="#2d2a3e"
              stroke-width="3.5"
              fill="none"
              stroke-linecap="round"
            />
            <path
              d="M74 52 Q83 41 92 52"
              stroke="#2d2a3e"
              stroke-width="3.5"
              fill="none"
              stroke-linecap="round"
            />
          }
          @case ('closed') {
            <path
              d="M48 50 Q57 58 66 50"
              stroke="#2d2a3e"
              stroke-width="3.5"
              fill="none"
              stroke-linecap="round"
            />
            <path
              d="M74 50 Q83 58 92 50"
              stroke="#2d2a3e"
              stroke-width="3.5"
              fill="none"
              stroke-linecap="round"
            />
          }
          @default {
            <g class="eyes">
              <circle cx="57" cy="50" r="10" fill="#fff" />
              <circle cx="83" cy="50" r="10" fill="#fff" />
              <circle [attr.cx]="57 + px()" [attr.cy]="50 + py()" r="5.6" fill="#2d2a3e" />
              <circle [attr.cx]="83 + px()" [attr.cy]="50 + py()" r="5.6" fill="#2d2a3e" />
              <circle [attr.cx]="58.8 + px()" [attr.cy]="48 + py()" r="2" fill="#fff" />
              <circle [attr.cx]="84.8 + px()" [attr.cy]="48 + py()" r="2" fill="#fff" />
              @if (eyes() === 'sleepy') {
                <path
                  d="M46 38 H68 V50 H46Z M72 38 H94 V50 H72Z"
                  fill="var(--fiona-head, #4b84da)"
                />
                <path
                  d="M47 50 H67 M73 50 H93"
                  stroke="#2d2a3e"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              }
            </g>
          }
        }

        <!-- pico (abierto en saludo, celebración y bostezo) -->
        @if (openBeak()) {
          <path
            d="M62 58 Q70 52 78 58 Q76 63 70 63 Q64 63 62 58Z"
            fill="#f4d79c"
            stroke="#d4a94f"
            stroke-width="1.5"
          />
          <path
            d="M64 63 Q70 73 76 63 Q70 66 64 63Z"
            fill="#e9855f"
            stroke="#d4a94f"
            stroke-width="1.5"
          />
        } @else {
          <path
            d="M62 58 Q70 52 78 58 Q76 71 70 73 Q64 71 62 58Z"
            fill="#f4d79c"
            stroke="#d4a94f"
            stroke-width="1.5"
          />
        }

        @switch (pose()) {
          @case ('cooking') {
            <g>
              <circle cx="58" cy="22" r="11" fill="#fff" />
              <circle cx="70" cy="16" r="12" fill="#fff" />
              <circle cx="82" cy="22" r="11" fill="#fff" />
              <rect
                x="56"
                y="26"
                width="28"
                height="9"
                rx="3"
                fill="#fff"
                stroke="#e8dcc0"
                stroke-width="1.5"
              />
            </g>
          }
          @case ('working') {
            <g stroke="#2d2a3e" stroke-width="2.6" fill="none">
              <circle cx="57" cy="50" r="12.5" />
              <circle cx="83" cy="50" r="12.5" />
              <path d="M69.5 50 H70.5" />
            </g>
          }
          @case ('sport') {
            <path
              d="M41 42 Q70 28 99 42 L99 49 Q70 35 41 49Z"
              fill="#ffad76"
              stroke="#e0834a"
              stroke-width="1.5"
            />
            <path class="drop" d="M104 34 Q108 41 104 45 Q100 41 104 34Z" fill="#56bceb" />
          }
          @case ('care') {
            <path
              d="M41 40 Q70 8 99 40 Q70 28 41 40Z"
              fill="#d8f5ec"
              stroke="#5ed1b1"
              stroke-width="2"
            />
            <path d="M52 30 Q70 18 88 30" stroke="#5ed1b1" stroke-width="2" fill="none" />
            <g>
              <circle cx="57" cy="50" r="10.5" fill="#b8ea86" stroke="#5ba11c" stroke-width="2" />
              <circle cx="57" cy="50" r="5" fill="none" stroke="#5ba11c" stroke-width="1.5" />
              <circle cx="83" cy="50" r="10.5" fill="#b8ea86" stroke="#5ba11c" stroke-width="2" />
              <circle cx="83" cy="50" r="5" fill="none" stroke="#5ba11c" stroke-width="1.5" />
            </g>
          }
          @case ('celebrating') {
            <path d="M70 4 L55 36 L85 36Z" fill="#c5a3ef" stroke="#9b77cc" stroke-width="1.5" />
            <path
              d="M62 22 L78 22 M58 30 L82 30"
              stroke="#fff"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <circle cx="70" cy="4" r="4.5" fill="#f58eb3" />
          }
          @case ('thinking') {
            <path
              d="M44 38 Q52 32 64 36"
              stroke="#2d2a3e"
              stroke-width="2.6"
              fill="none"
              stroke-linecap="round"
            />
          }
        }
      </g>

      <!-- objetos y efectos por pose -->
      @switch (pose()) {
        @case ('cooking') {
          <g class="steam" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round">
            <path d="M60 104 q-5 -8 0 -15" />
            <path d="M72 104 q-5 -8 0 -15" />
            <path d="M84 104 q-5 -8 0 -15" />
          </g>
          <path
            d="M44 106 H96 V120 Q96 134 82 134 H58 Q44 134 44 120Z"
            fill="#ffad76"
            stroke="#e0834a"
            stroke-width="2.5"
          />
          <path
            d="M44 112 H36 M96 112 H104"
            stroke="#e0834a"
            stroke-width="4"
            stroke-linecap="round"
          />
          <path d="M30 100 L22 76" stroke="#b57b45" stroke-width="4" stroke-linecap="round" />
          <ellipse cx="21" cy="72" rx="6" ry="8" fill="#d9a066" transform="rotate(-14 21 72)" />
        }
        @case ('working') {
          <rect
            x="48"
            y="92"
            width="44"
            height="24"
            rx="4"
            fill="#56bceb"
            stroke="#2d2a3e"
            stroke-width="2.4"
          />
          <path
            d="M54 99 H68 M54 105 H78 M54 111 H64"
            stroke="#fff"
            stroke-width="2.6"
            stroke-linecap="round"
          />
          <path
            d="M38 116 H102 L108 132 H32Z"
            fill="#cfd6e4"
            stroke="#2d2a3e"
            stroke-width="2.4"
            stroke-linejoin="round"
          />
        }
        @case ('sport') {
          <rect x="38" y="104" width="64" height="6" rx="3" fill="#6a6478" />
          <rect x="31" y="94" width="10" height="26" rx="4" fill="#2d2a3e" />
          <rect x="99" y="94" width="10" height="26" rx="4" fill="#2d2a3e" />
          <rect x="25" y="99" width="7" height="16" rx="3" fill="#6a6478" />
          <rect x="108" y="99" width="7" height="16" rx="3" fill="#6a6478" />
        }
        @case ('saving') {
          <circle cx="70" cy="114" r="17" fill="#ffd25e" stroke="#e0a92a" stroke-width="3" />
          <text
            x="70"
            y="121"
            text-anchor="middle"
            font-size="20"
            font-weight="800"
            fill="#a8740a"
            font-family="system-ui, sans-serif"
          >
            €
          </text>
          <g class="spark" fill="#ffd25e">
            <path d="M26 56 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
            <path d="M112 70 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z" />
          </g>
        }
        @case ('care') {
          <g class="bubbles" fill="#fff" stroke="#5ed1b1" stroke-width="1.6">
            <circle cx="24" cy="60" r="6" />
            <circle cx="116" cy="46" r="8" />
            <circle cx="108" cy="112" r="5" />
            <circle cx="30" cy="106" r="4" />
          </g>
        }
        @case ('celebrating') {
          <g class="confetti">
            <rect
              x="18"
              y="34"
              width="8"
              height="4"
              rx="1"
              fill="#f58eb3"
              transform="rotate(30 22 36)"
            />
            <rect
              x="112"
              y="30"
              width="8"
              height="4"
              rx="1"
              fill="#56bceb"
              transform="rotate(-25 116 32)"
            />
            <rect x="26" y="78" width="7" height="4" rx="1" fill="#ffad76" />
            <rect
              x="112"
              y="84"
              width="8"
              height="4"
              rx="1"
              fill="#8dd64c"
              transform="rotate(40 116 86)"
            />
            <circle cx="12" cy="58" r="3" fill="#c5a3ef" />
            <circle cx="128" cy="62" r="3" fill="#ffd25e" />
          </g>
        }
        @case ('resting') {
          <path
            d="M26 100 Q70 82 114 100 V134 Q70 142 26 134Z"
            fill="#c5a3ef"
            stroke="#9b77cc"
            stroke-width="2.5"
          />
          <path
            d="M70 126 q-9 -6 -9 -12 a5 5 0 0 1 9 -2 a5 5 0 0 1 9 2 q0 6 -9 12z"
            fill="#f58eb3"
          />
          <g class="zzz" fill="#7448b8" font-weight="800" font-family="system-ui, sans-serif">
            <text x="104" y="38" font-size="17">z</text>
            <text x="116" y="24" font-size="13">z</text>
            <text x="125" y="13" font-size="10">z</text>
          </g>
        }
        @case ('thinking') {
          <circle cx="106" cy="34" r="3.5" fill="#fff" stroke="#c9bfd8" stroke-width="1.6" />
          <circle cx="113" cy="24" r="5" fill="#fff" stroke="#c9bfd8" stroke-width="1.6" />
          <ellipse cx="119" cy="9" rx="18" ry="9" fill="#fff" stroke="#c9bfd8" stroke-width="1.6" />
          <text
            x="119"
            y="14"
            text-anchor="middle"
            font-size="13"
            font-weight="800"
            fill="#7448b8"
            font-family="system-ui, sans-serif"
          >
            ?
          </text>
        }
        @case ('waiting') {
          <g class="dots" fill="#56bceb">
            <circle cx="58" cy="12" r="4.5" />
            <circle cx="70" cy="12" r="4.5" />
            <circle cx="82" cy="12" r="4.5" />
          </g>
        }
        @case ('waking') {
          <g class="spark" fill="#ffd25e">
            <path d="M110 30 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z" />
          </g>
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 0;
      }
      svg {
        overflow: visible;
      }
      .body,
      .head {
        transform-box: fill-box;
        transform-origin: 50% 100%;
        animation: breathe 2.8s ease-in-out infinite;
      }
      .head {
        animation-delay: 0.15s;
      }
      .eyes {
        transform-box: fill-box;
        transform-origin: center;
        animation: blink 5s infinite;
      }
      .f-greeting .wing-anim {
        transform-box: view-box;
        transform-origin: 102px 72px;
        animation: wave 1s ease-in-out infinite;
      }
      .f-celebrating .body,
      .f-celebrating .head {
        animation: hop 0.9s ease-in-out infinite;
      }
      .f-waking .body {
        animation: stretch 2.4s ease-in-out infinite;
      }
      .f-waiting .head {
        animation: look 3s ease-in-out infinite;
      }
      .dots circle {
        animation: bounce 1.1s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
      .dots circle:nth-child(2) {
        animation-delay: 0.15s;
      }
      .dots circle:nth-child(3) {
        animation-delay: 0.3s;
      }
      .zzz text {
        animation: floatz 2.6s ease-in-out infinite;
      }
      .zzz text:nth-child(2) {
        animation-delay: 0.5s;
      }
      .zzz text:nth-child(3) {
        animation-delay: 1s;
      }
      .steam path {
        animation: steam 1.8s ease-in-out infinite;
      }
      .steam path:nth-child(2) {
        animation-delay: 0.4s;
      }
      .steam path:nth-child(3) {
        animation-delay: 0.8s;
      }
      .confetti > * {
        animation: fall 1.8s ease-in infinite;
        transform-box: fill-box;
      }
      .confetti > *:nth-child(even) {
        animation-delay: 0.6s;
      }
      .spark path {
        transform-box: fill-box;
        transform-origin: center;
        animation: twinkle 1.6s ease-in-out infinite;
      }
      .bubbles circle {
        animation: floatb 3s ease-in-out infinite;
      }
      .bubbles circle:nth-child(2) {
        animation-delay: 0.8s;
      }
      .bubbles circle:nth-child(3) {
        animation-delay: 1.6s;
      }
      .drop {
        animation: floatb 1.4s ease-in infinite;
      }
      @keyframes breathe {
        0%,
        100% {
          transform: scale(1, 1);
        }
        50% {
          transform: scale(1.015, 1.03);
        }
      }
      @keyframes blink {
        0%,
        92%,
        100% {
          transform: scaleY(1);
        }
        95% {
          transform: scaleY(0.1);
        }
      }
      @keyframes wave {
        0%,
        100% {
          transform: rotate(0);
        }
        50% {
          transform: rotate(-16deg);
        }
      }
      @keyframes hop {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-6px);
        }
      }
      @keyframes stretch {
        0%,
        100% {
          transform: scale(1, 1);
        }
        50% {
          transform: scale(0.96, 1.07);
        }
      }
      @keyframes look {
        0%,
        100% {
          transform: rotate(0);
        }
        50% {
          transform: rotate(4deg);
        }
      }
      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-7px);
        }
      }
      @keyframes floatz {
        0%,
        100% {
          opacity: 0.35;
          transform: translateY(2px);
        }
        50% {
          opacity: 1;
          transform: translateY(-3px);
        }
      }
      @keyframes steam {
        0%,
        100% {
          opacity: 0;
          transform: translateY(4px);
        }
        50% {
          opacity: 0.9;
          transform: translateY(-3px);
        }
      }
      @keyframes fall {
        0% {
          transform: translateY(-6px);
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        100% {
          transform: translateY(14px);
          opacity: 0;
        }
      }
      @keyframes twinkle {
        0%,
        100% {
          transform: scale(0.7);
          opacity: 0.6;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
      @keyframes floatb {
        0%,
        100% {
          transform: translateY(0);
          opacity: 0.9;
        }
        50% {
          transform: translateY(-6px);
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class Fiona {
  readonly pose = input<FionaPose>('greeting');
  readonly size = input(96);
  /** Texto para lectores de pantalla; sin él, el dibujo es decorativo. */
  readonly label = input('');
  protected readonly eyes = computed(() => EYES[this.pose()]);
  protected readonly openBeak = computed(() =>
    ['greeting', 'celebrating', 'waking'].includes(this.pose()),
  );
  protected readonly px = computed(() => (this.eyes() === 'side' ? 3 : 0));
  protected readonly py = computed(() => (this.eyes() === 'up' ? -3 : 0));
  protected readonly wingL = computed(() => {
    switch (this.pose()) {
      case 'celebrating':
        return 'rotate(-130 38 72)';
      case 'waking':
        return 'rotate(40 38 72)';
      case 'sport':
        return 'rotate(-30 38 100)';
      case 'cooking':
        return 'rotate(-12 38 72)';
      default:
        return null;
    }
  });
  protected readonly wingR = computed(() => {
    switch (this.pose()) {
      case 'greeting':
        return 'rotate(-135 102 72)';
      case 'celebrating':
        return 'rotate(130 102 72)';
      case 'waking':
        return 'rotate(-40 102 72)';
      case 'sport':
        return 'rotate(30 102 100)';
      case 'thinking':
        return 'rotate(-150 102 72)';
      default:
        return null;
    }
  });
}
