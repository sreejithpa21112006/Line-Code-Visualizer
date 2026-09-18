# Digital Communication Waveform Generator

Vercel-ready static web application containing both:

1. Line Coding
2. Direct Sequence Spread Spectrum (DSSS)

## Line Coding

The application generates:

- Unipolar NRZ
- Polar NRZ-L
- Polar NRZ-I
- Polar RZ
- Manchester
- Differential Manchester
- AMI

Default data:

`101110`

## DSSS

The application generates:

- Data Bits
- PN Sequence Bits
- Transmitted Bits
- Received Bits
- Local PN Template
- Demodulator Output
- Recovered Data

Default values:

Data:

`101110`

PN:

`101100111001`

Tb = 2Tc.

Default DSSS results:

Transmitted:

`011111000101`

Received:

`011111000101`

Demodulator output:

`110011111100`

Recovered data:

`101110`

## Deploy to Vercel from GitHub

Upload these files to the root of a GitHub repository:

- index.html
- style.css
- script.js
- README.md

Then import the repository into Vercel and deploy it as a static site. No Python runtime or build command is required.
