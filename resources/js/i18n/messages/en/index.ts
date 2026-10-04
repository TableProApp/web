/**
 * The English UI catalog, one namespace per file. English is the source of
 * truth for the shape: `Messages` in ../../types.ts is derived from this object.
 *
 * Each namespace lives in its own file; add a namespace by adding its file and
 * one import here.
 */
import common from './common.ts';
import nav from './nav.ts';
import footer from './footer.ts';
import controls from './controls.ts';
import consent from './consent.ts';
import banner from './banner.ts';
import forms from './forms.ts';
import platforms from './platforms.ts';
import pricing from './pricing.ts';
import download from './download.ts';
import blog from './blog.ts';
import assets from './assets.ts';
import errors from './errors.ts';
import seo from './seo.ts';
import a11y from './a11y.ts';

const en = {
    common,
    nav,
    footer,
    controls,
    consent,
    banner,
    forms,
    platforms,
    pricing,
    download,
    blog,
    assets,
    errors,
    seo,
    a11y,
};

export default en;
