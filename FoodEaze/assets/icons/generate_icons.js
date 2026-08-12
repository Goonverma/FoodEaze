const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = __dirname;
fs.mkdirSync(outDir, { recursive: true });

const blue = '#2563EB';
const blueDark = '#1747B5';
const blueLight = '#EAF4FF';
const white = '#FFFFFF';
const green = '#16A34A';

function cardSvg(content) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="transparent"/>
    <rect x="120" y="120" width="784" height="784" rx="240" fill="${blueLight}" stroke="${blue}" stroke-width="24"/>
    <rect x="190" y="190" width="644" height="644" rx="190" fill="${white}" stroke="${blueDark}" stroke-width="16" opacity="0.95"/>
    ${content}
  </svg>`;
}

function writeIcon(name, svg) {
    const svgPath = path.join(outDir, `${name}.svg`);
    const pngPath = path.join(outDir, `${name}.png`);
    fs.writeFileSync(svgPath, svg);
    sharp(Buffer.from(svg)).resize(1024, 1024).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngPath)
        .then(() => console.log(`Created ${path.basename(pngPath)}`))
        .catch(err => { console.error(err); process.exit(1); });
}

const icons = [
    ['orders', cardSvg(`
    <rect x="320" y="360" width="384" height="240" rx="48" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <rect x="390" y="300" width="244" height="98" rx="36" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <rect x="376" y="396" width="272" height="84" rx="20" fill="${blue}"/>
    <rect x="430" y="440" width="164" height="24" rx="12" fill="${white}"/>
    <path d="M390 310h244" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M454 298v-50h116v50" stroke="${blueDark}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="448" y="612" width="128" height="44" rx="22" fill="${blue}"/>
  `)],
    ['pending-orders', cardSvg(`
    <circle cx="512" cy="512" r="180" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <path d="M512 372v140l92 92" stroke="${blue}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="332" y="360" width="180" height="132" rx="28" fill="${blueLight}" stroke="${blueDark}" stroke-width="18"/>
    <rect x="360" y="388" width="124" height="76" rx="20" fill="${blue}"/>
    <path d="M386 418h72" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
    <path d="M386 442h56" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
  `)],
    ['preparing', cardSvg(`
    <path d="M360 272h304c44 0 80 36 80 80v140c0 44-36 80-80 80H360c-44 0-80-36-80-80V352c0-44 36-80 80-80Z" fill="${blueLight}" stroke="${blueDark}" stroke-width="20"/>
    <path d="M390 736h244" stroke="${blueDark}" stroke-width="24" stroke-linecap="round"/>
    <path d="M456 326h112c54 0 98 44 98 98v64H358v-64c0-54 44-98 98-98Z" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <path d="M418 338c0-40 30-74 70-74 34 0 63 24 69 56" stroke="${blue}" stroke-width="22" stroke-linecap="round"/>
    <path d="M404 432h216" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M420 470h184" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M482 258v-44" stroke="${blueDark}" stroke-width="20" stroke-linecap="round"/>
    <path d="M546 258v-44" stroke="${blueDark}" stroke-width="20" stroke-linecap="round"/>
    <rect x="432" y="500" width="160" height="112" rx="34" fill="${blue}"/>
    <path d="M474 502v112" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
    <path d="M552 502v112" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
  `)],
    ['delivered', cardSvg(`
    <rect x="292" y="346" width="440" height="276" rx="54" fill="${blueLight}" stroke="${blueDark}" stroke-width="20"/>
    <rect x="332" y="386" width="360" height="196" rx="34" fill="${white}" stroke="${blueDark}" stroke-width="18"/>
    <path d="M392 492l86 86 154-174" stroke="${green}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="712" cy="452" r="58" fill="${green}"/>
    <path d="M692 452l14 14 28-34" stroke="${white}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  `)],
    ['browse-menu', cardSvg(`
    <rect x="300" y="270" width="424" height="484" rx="52" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <rect x="340" y="318" width="344" height="80" rx="28" fill="${blueLight}"/>
    <path d="M378 358h268" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M362 424h300" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M362 486h300" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M362 548h300" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M362 610h224" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M706 418c0-42 34-76 76-76" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
    <path d="M706 556c0 42 34 76 76 76" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
    <path d="M706 418h76" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
    <path d="M706 632h76" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
  `)],
    ['track-orders', cardSvg(`
    <path d="M512 268c112 0 204 90 204 202 0 116-154 284-154 284S308 586 308 470c0-112 92-202 204-202Z" fill="${blueLight}" stroke="${blueDark}" stroke-width="20"/>
    <circle cx="512" cy="470" r="96" fill="${white}" stroke="${blue}" stroke-width="24"/>
    <path d="M372 724l90-84" stroke="${blueDark}" stroke-width="24" stroke-linecap="round"/>
    <path d="M652 724l-90-84" stroke="${blueDark}" stroke-width="24" stroke-linecap="round"/>
    <path d="M512 336v72" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
    <path d="M452 520h120" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
    <path d="M512 470l74-74" stroke="${blue}" stroke-width="24" stroke-linecap="round"/>
  `)],
    ['order-history', cardSvg(`
    <rect x="312" y="274" width="400" height="480" rx="54" fill="${white}" stroke="${blueDark}" stroke-width="20"/>
    <rect x="356" y="320" width="312" height="60" rx="22" fill="${blueLight}"/>
    <path d="M392 350h240" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M374 438h276" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M374 500h276" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <path d="M374 562h200" stroke="${blueDark}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="690" cy="564" r="42" fill="${blue}"/>
    <path d="M670 564l12 12 28-30" stroke="${white}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  `)],
    ['user-profile', cardSvg(`
    <circle cx="512" cy="438" r="146" fill="${blueLight}" stroke="${blueDark}" stroke-width="20"/>
    <circle cx="512" cy="410" r="94" fill="${white}" stroke="${blue}" stroke-width="20"/>
    <circle cx="512" cy="372" r="54" fill="${blue}"/>
    <path d="M392 690c30-92 88-140 120-140 32 0 90 48 120 140" fill="${blue}"/>
    <path d="M446 392h132" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
    <path d="M462 424h100" stroke="${white}" stroke-width="18" stroke-linecap="round"/>
  `)]
];

Promise.all(icons.map(([name, svg]) => new Promise((resolve, reject) => {
    sharp(Buffer.from(svg)).resize(1024, 1024).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(outDir, `${name}.png`))
        .then(() => {
            fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
            console.log(`Created ${name}.png`);
            resolve();
        })
        .catch(reject);
}))).then(() => {
    console.log('All icons created successfully.');
});
