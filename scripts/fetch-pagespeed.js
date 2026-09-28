import https from 'https';

function fetchPageSpeed(strategy = 'mobile') {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fmirrorsolarvision.com%2F&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
    console.log(`Analyzing https://mirrorsolarvision.com/ for ${strategy}...`);

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

async function runAudit() {
  try {
    const mobileData = await fetchPageSpeed('mobile');
    const desktopData = await fetchPageSpeed('desktop');

    const mCategories = mobileData.lighthouseResult.categories;
    const mAudits = mobileData.lighthouseResult.audits;

    const dCategories = desktopData.lighthouseResult.categories;
    const dAudits = desktopData.lighthouseResult.audits;

    console.log('\n=== MOBILE AUDIT RESULTS ===');
    console.log(`Performance Score: ${Math.round(mCategories.performance.score * 100)}/100`);
    console.log(`Accessibility Score: ${Math.round(mCategories.accessibility.score * 100)}/100`);
    console.log(`Best Practices Score: ${Math.round(mCategories['best-practices'].score * 100)}/100`);
    console.log(`SEO Score: ${Math.round(mCategories.seo.score * 100)}/100`);
    console.log(`First Contentful Paint (FCP): ${mAudits['first-contentful-paint'].displayValue}`);
    console.log(`Largest Contentful Paint (LCP): ${mAudits['largest-contentful-paint'].displayValue}`);
    console.log(`Total Blocking Time (TBT): ${mAudits['total-blocking-time'].displayValue}`);
    console.log(`Cumulative Layout Shift (CLS): ${mAudits['cumulative-layout-shift'].displayValue}`);
    console.log(`Speed Index (SI): ${mAudits['speed-index'].displayValue}`);
    console.log(`Total Byte Weight: ${mAudits['total-byte-weight']?.displayValue || 'N/A'}`);

    console.log('\n=== DESKTOP AUDIT RESULTS ===');
    console.log(`Performance Score: ${Math.round(dCategories.performance.score * 100)}/100`);
    console.log(`Accessibility Score: ${Math.round(dCategories.accessibility.score * 100)}/100`);
    console.log(`Best Practices Score: ${Math.round(dCategories['best-practices'].score * 100)}/100`);
    console.log(`SEO Score: ${Math.round(dCategories.seo.score * 100)}/100`);
    console.log(`First Contentful Paint (FCP): ${dAudits['first-contentful-paint'].displayValue}`);
    console.log(`Largest Contentful Paint (LCP): ${dAudits['largest-contentful-paint'].displayValue}`);
    console.log(`Total Blocking Time (TBT): ${dAudits['total-blocking-time'].displayValue}`);
    console.log(`Cumulative Layout Shift (CLS): ${dAudits['cumulative-layout-shift'].displayValue}`);
    console.log(`Speed Index (SI): ${dAudits['speed-index'].displayValue}`);
    console.log(`Total Byte Weight: ${dAudits['total-byte-weight']?.displayValue || 'N/A'}`);

  } catch (err) {
    console.error('PageSpeed API Error:', err.message);
  }
}

runAudit();
