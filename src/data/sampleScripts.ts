export interface SampleScript {
  id: string;
  title: string;
  genre: string;
  logline: string;
  recommendedStyle: string;
  aspectRatio: string;
  script: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'cyberpunk-neon-heist',
    title: 'THE CHROMIUM VAULT',
    genre: 'Cyberpunk Sci-Fi Thriller',
    logline: 'An augmented thief infiltrates a fortified corporate data tower during a torrential acid-rain storm.',
    recommendedStyle: 'Cinematic Film Still (35mm Anamorphic)',
    aspectRatio: '16:9',
    script: `EXT. NEO-KOWLOON MEGATOWER - ROOFTOP - NIGHT

Torrential rain lashes against towering carbon-glass spires. Holographic neon advertisements cast iridescent cyan and magenta ribbons across the slick, oil-stained steel deck.

KIRA (30s), clad in a matte-black tactical cloak with glowing amber neural optics embedded along her temple, crouches near the edge of the ventilating exhaust shaft.

Steam erupts around her boots. She lifts a micro-lens scanner to her right eye.

KIRA
(whispering into sub-vocal comms)
"Security grid cycling in ten seconds. If the pulse drops, I'm dropping with it."

Through her optic POV: Red lasers criss-cross the shaft in geometric lattices, then FLICKER out.

She dives headfirst into the darkness of the shaft.

INT. DATA STORAGE SANCTUARY - CONTINUOUS

Kira lands silently on a mirror-smooth obsidian floor. Thousands of bioluminescent quantum storage pods pulse with deep emerald light, ascending into infinity.

A heavy mechanical footsteps RUMBLE. A hulking CYBERNETIC ENFORCER emerges from the steam curtain, a rotary coilgun humming alive.

Kira draws dual plasma blades. The blue energy sparks against the damp atmosphere.

KIRA
"Took you long enough."`,
  },
  {
    id: 'noir-shadows',
    title: 'WHISKEY AND COLD RAIN',
    genre: 'Classic Film Noir',
    logline: 'A cynical private investigator is visited late at night by an enigmatic heiress carrying a sealed envelope.',
    recommendedStyle: 'Graphic Novel Noir (High-Contrast Ink)',
    aspectRatio: '16:9',
    script: `INT. JACK MALONE'S OFFICE - MIDNIGHT

Venetian blinds slice the amber neon from the street into harsh geometric stripes across the dusty mahogany desk. A cigarette smolders in a heavy glass ashtray.

JACK MALONE (40s), rumpled trench coat, fedora tilted low over tired eyes, pours amber bourbon into a chipped glass.

Outside, thunder CRACKS. Rain drums violently against the frosted glass door marked "MALONE INVESTIGATIONS".

The silhouette of a woman appears behind the glass. Three precise, deliberate raps on the pane.

MALONE
"We're closed, sister. Come back when the sun feels like showing up."

The brass doorknob turns. EVELYN CROSS (30s) steps inside. Platinum hair beneath a black birdcage veil, scarlet lipstick, and eyes colder than a winter morgue.

She tosses a water-stained Manila envelope onto Malone's desk.

EVELYN
"By morning, Mr. Malone, you won't have the luxury of turning down forty thousand dollars."

Malone picks up the envelope. A single polaroid spills out. His jaw tightens.`,
  },
  {
    id: 'deep-space-signal',
    title: 'THE ODYSSEY CONDUIT',
    genre: 'Hard Sci-Fi / Cosmic Wonder',
    logline: 'Astronauts on a deep-space survey station discover an anomalous crystalline structure floating in Saturn\'s rings.',
    recommendedStyle: 'Hyper-Realistic Concept Matte',
    aspectRatio: '16:9',
    script: `EXT. ORBIT AROUND SATURN - RING PLANE

The majestic golden arc of Saturn fills half the frame. Countless icy boulders tumble in silent celestial choreography.

The research vessel ASTRAEA, an intricate spine of solar sails and pressurized centrifuge modules, drifts toward a colossal geometric anomaly: a floating obsidian monolith etched with glowing violet glyphs.

INT. OBSERVATION DECK - CONTINUOUS

COMMANDER VANCE (50s) stares out the polarized viewport, his reflective gold visor capturing the alien glow.

DR. ELENA ROSTOVA (30s) rapidly works the holographic telemetry console. Audio static transforms into a rhythmic, harmonic chime.

DR. ROSTOVA
"Commander... it's not a spatial echo. It's an invitation."

Vance places his gloved hand against the reinforced quartz glass. Outside, the monolith blossoms open like an origami flower, revealing a gateway of folding starlight.`,
  },
  {
    id: 'western-showdown',
    title: 'HIGH NOON AT BRIMSTONE',
    genre: 'Cinematic Western',
    logline: 'Two rival gunslingers face off in the dust-swept ghost town where their feud began twenty years ago.',
    recommendedStyle: 'Hollywood Production Pencil Sketch',
    aspectRatio: '16:9',
    script: `EXT. MAIN STREET - BRIMSTONE GHOST TOWN - HIGH NOON

Blistering desert heat shimmers above cracked alkaline earth. A tumbleweed scuttles past the weathered boardwalk of the abandoned saloon.

COLT HARDIN (50s), dust-caked duster coat, silver spurs clicking with every measured step, halts thirty yards down the thoroughfare. His right hand hovers an inch above his ivory-handled revolver.

Across the street stands SILAS VANE (40s), scarred jaw, eyes like flint, a repeating carbine slung over his shoulder.

A hawk SCREECHES high in the cloudless cobalt sky.

EXTREME CLOSE-UP - HARDIN'S EYES
Squinting against the blinding glare. Sweat tracing down a weather-beaten cheek.

EXTREME CLOSE-UP - VANE'S FINGERS
Twitching against the leather holster.

A church bell toll ECHOES through the empty canyon. On the stroke of twelve... both men draw.`,
  },
];
