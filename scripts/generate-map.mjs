import fs from 'node:fs';
import crypto from 'node:crypto';

const WIDTH = 1440;
const HEIGHT = 720;
const sourcePath = 'data/source/ne_50m_admin_0_countries.geojson';
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const sourceSha256 = crypto
  .createHash('sha256')
  .update(fs.readFileSync(sourcePath))
  .digest('hex');
const rows = `AFG|Afghanistan
ALB|Albania
DZA|Algeria
AND|Andorra
AGO|Angola
ATG|Antigua and Barbuda
ARG|Argentina
ARM|Armenia
AUS|Australia
AUT|Austria
AZE|Azerbaijan
BHS|Bahamas
BHR|Bahrain
BGD|Bangladesh
BRB|Barbados
BLR|Belarus
BEL|Belgium
BLZ|Belize
BEN|Benin
BTN|Bhutan
BOL|Bolivia
BIH|Bosnia and Herzegovina
BWA|Botswana
BRA|Brazil
BRN|Brunei
BGR|Bulgaria
BFA|Burkina Faso
BDI|Burundi
CPV|Cabo Verde
KHM|Cambodia
CMR|Cameroon
CAN|Canada
CAF|Central African Republic
TCD|Chad
CHL|Chile
CHN|China
COL|Colombia
COM|Comoros
COG|Republic of the Congo
COD|Democratic Republic of the Congo
CRI|Costa Rica
CIV|Côte d'Ivoire
HRV|Croatia
CUB|Cuba
CYP|Cyprus
CZE|Czechia
DNK|Denmark
DJI|Djibouti
DMA|Dominica
DOM|Dominican Republic
ECU|Ecuador
EGY|Egypt
SLV|El Salvador
GNQ|Equatorial Guinea
ERI|Eritrea
EST|Estonia
SWZ|Eswatini
ETH|Ethiopia
FJI|Fiji
FIN|Finland
FRA|France
GAB|Gabon
GMB|Gambia
GEO|Georgia
DEU|Germany
GHA|Ghana
GRC|Greece
GRD|Grenada
GTM|Guatemala
GIN|Guinea
GNB|Guinea-Bissau
GUY|Guyana
HTI|Haiti
HND|Honduras
HUN|Hungary
ISL|Iceland
IND|India
IDN|Indonesia
IRN|Iran
IRQ|Iraq
IRL|Ireland
ISR|Israel
ITA|Italy
JAM|Jamaica
JPN|Japan
JOR|Jordan
KAZ|Kazakhstan
KEN|Kenya
KIR|Kiribati
PRK|North Korea
KOR|South Korea
KWT|Kuwait
KGZ|Kyrgyzstan
LAO|Laos
LVA|Latvia
LBN|Lebanon
LSO|Lesotho
LBR|Liberia
LBY|Libya
LIE|Liechtenstein
LTU|Lithuania
LUX|Luxembourg
MDG|Madagascar
MWI|Malawi
MYS|Malaysia
MDV|Maldives
MLI|Mali
MLT|Malta
MHL|Marshall Islands
MRT|Mauritania
MUS|Mauritius
MEX|Mexico
FSM|Micronesia
MDA|Moldova
MCO|Monaco
MNG|Mongolia
MNE|Montenegro
MAR|Morocco
MOZ|Mozambique
MMR|Myanmar
NAM|Namibia
NRU|Nauru
NPL|Nepal
NLD|Netherlands
NZL|New Zealand
NIC|Nicaragua
NER|Niger
NGA|Nigeria
MKD|North Macedonia
NOR|Norway
OMN|Oman
PAK|Pakistan
PLW|Palau
PAN|Panama
PNG|Papua New Guinea
PRY|Paraguay
PER|Peru
PHL|Philippines
POL|Poland
PRT|Portugal
QAT|Qatar
ROU|Romania
RUS|Russia
RWA|Rwanda
KNA|Saint Kitts and Nevis
LCA|Saint Lucia
VCT|Saint Vincent and the Grenadines
WSM|Samoa
SMR|San Marino
STP|Sao Tome and Principe
SAU|Saudi Arabia
SEN|Senegal
SRB|Serbia
SYC|Seychelles
SLE|Sierra Leone
SGP|Singapore
SVK|Slovakia
SVN|Slovenia
SLB|Solomon Islands
SOM|Somalia
ZAF|South Africa
SSD|South Sudan
ESP|Spain
LKA|Sri Lanka
SDN|Sudan
SUR|Suriname
SWE|Sweden
CHE|Switzerland
SYR|Syria
TJK|Tajikistan
TZA|Tanzania
THA|Thailand
TLS|Timor-Leste
TGO|Togo
TON|Tonga
TTO|Trinidad and Tobago
TUN|Tunisia
TUR|Türkiye
TKM|Turkmenistan
TUV|Tuvalu
UGA|Uganda
UKR|Ukraine
ARE|United Arab Emirates
GBR|United Kingdom
USA|United States
URY|Uruguay
UZB|Uzbekistan
VUT|Vanuatu
VEN|Venezuela
VNM|Vietnam
YEM|Yemen
ZMB|Zambia
ZWE|Zimbabwe
VAT|Holy See
PSE|Palestine`
  .trim()
  .split('\n')
  .map((line) => {
    const [iso3, name] = line.split('|');
    return { id: `iso:${iso3}`, iso3, name, geometryRefs: [`iso:${iso3}`] };
  });

function sqDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (!dx && !dy)
    return (point[0] - start[0]) ** 2 + (point[1] - start[1]) ** 2;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
        (dx * dx + dy * dy),
    ),
  );
  return (
    (point[0] - (start[0] + t * dx)) ** 2 +
    (point[1] - (start[1] + t * dy)) ** 2
  );
}
function simplify(points, tolerance = 0.12) {
  if (points.length < 3) return points;
  let max = tolerance ** 2;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = sqDistance(points[i], points[0], points.at(-1));
    if (d > max) {
      index = i;
      max = d;
    }
  }
  if (!index) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, index + 1), tolerance),
    ...simplify(points.slice(index), tolerance).slice(1),
  ];
}
function project([lon, lat]) {
  return [
    +(((lon + 180) / 360) * WIDTH).toFixed(2),
    +(((90 - lat) / 180) * HEIGHT).toFixed(2),
  ];
}
function ringPath(ring) {
  const projected = ring.map(project);
  const simplified = simplify(projected, 0.55);
  return (
    simplified.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('') + 'Z'
  );
}
function geometryPaths(geometry) {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap((polygon) => polygon.map(ringPath));
}
function featureKey(feature) {
  const p = feature.properties;
  return [p.ISO_A3, p.ADM0_A3, p.SOV_A3, p.GU_A3].filter(
    (value) => value && value !== '-99',
  );
}
const featureByIso = new Map();
for (const feature of source.features)
  for (const key of featureKey(feature))
    if (!featureByIso.has(key)) featureByIso.set(key, feature);
const locations = rows.map((location) => {
  const feature = featureByIso.get(location.iso3);
  if (!feature)
    throw new Error(
      `No Natural Earth feature for ${location.iso3} (${location.name})`,
    );
  return {
    ...location,
    geometryRefs: [location.id],
    paths: geometryPaths(feature.geometry),
    anchor:
      feature.properties.LABEL_X && feature.properties.LABEL_Y
        ? project([feature.properties.LABEL_X, feature.properties.LABEL_Y])
        : project(feature.bbox.slice(0, 2)),
  };
});
const map = {
  width: WIDTH,
  height: HEIGHT,
  source: {
    product: 'Natural Earth Admin 0 countries',
    version: 'v5.1.1',
    scale: '1:50m',
    url: 'https://github.com/nvkelso/natural-earth-vector/tree/v5.1.1/geojson',
    sha256: sourceSha256,
    license: 'Public domain',
    disclaimer:
      'Boundaries are shown for gameplay visualization and do not imply endorsement of any boundary claim.',
  },
  paths: Object.fromEntries(
    locations.map((location) => [location.id, location.paths]),
  ),
  anchors: Object.fromEntries(
    locations.map((location) => [location.id, location.anchor]),
  ),
};
fs.mkdirSync('data/generated', { recursive: true });
fs.writeFileSync(
  'data/generated/map.json',
  JSON.stringify(map, null, 2) + '\n',
);
fs.writeFileSync(
  'data/generated/catalog.json',
  JSON.stringify(
    locations.map(({ paths, anchor, ...location }) => location),
    null,
    2,
  ) + '\n',
);
fs.writeFileSync(
  'data/generated/quiz.json',
  JSON.stringify(
    { id: 'world-195', locationIds: locations.map((location) => location.id) },
    null,
    2,
  ) + '\n',
);
fs.writeFileSync(
  'data/generated/manifest.json',
  JSON.stringify(
    {
      sourceSha256,
      generatedAt: 'deterministic',
      locations: Object.fromEntries(
        locations.map((location) => [location.id, location.geometryRefs]),
      ),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Generated ${locations.length} locations from ${source.features.length} Natural Earth features.`,
);
