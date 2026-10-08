/**
 * MIRROR SOLAR VISION & MIRROR AQUA
 * Automated Customer Data Collector, Excel/CSV Exporter & Shiprocket Push Auto-Retry Script
 * 
 * Usage:
 *   node scripts/sync-customer-excel-shiprocket.js
 *   node scripts/sync-customer-excel-shiprocket.js --retry-unpushed
 */

import fs from 'fs';
import path from 'path';

async function main() {
  console.log('===============================================================');
  console.log('  MIRROR SOLAR VISION & MIRROR AQUA — CUSTOMER & ORDER SYNC');
  console.log('===============================================================\n');

  const projectId = 'mirror-solar-vision';
  const apiUrl = `https://us-central1-${projectId}.cloudfunctions.net`;

  console.log(`[1/3] Connecting to Cloud Functions at ${apiUrl}...`);

  // 1. Fetch Executive Summary & Diagnostics
  try {
    const summaryRes = await fetch(`${apiUrl}/getCustomerOrdersSummary`);
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      const metrics = summaryData.metrics || {};

      console.log('\n📊 EXECUTIVE BUSINESS & CUSTOMER SUMMARY:');
      console.log('---------------------------------------------------------------');
      console.log(`• Total Orders Recorded:      ${metrics.totalOrdersRecorded || 0}`);
      console.log(`• Paid & Confirmed Orders:    ${metrics.paidOrdersCount || 0}`);
      console.log(`• Total Revenue Collected:    ₹${(metrics.totalRevenueInr || 0).toLocaleString('en-IN')}`);
      console.log(`• Unpushed Shiprocket Orders: ${metrics.unpushedShiprocketCount || 0}`);
      
      if (metrics.unpushedShiprocketCount > 0) {
        console.log('\n⚠️ ATTENTION: The following paid orders need Shiprocket dispatch:');
        (metrics.unpushedBookingIds || []).forEach((ord, idx) => {
          console.log(`  ${idx + 1}. ID: ${ord.bookingId} | Customer: ${ord.customerName} (${ord.customerPhone}) | Amount: ₹${ord.amount}`);
        });
      } else {
        console.log('\n✅ 100% of paid orders have been successfully synced to Shiprocket!');
      }

      console.log('\n🏙️ Top Customer Locations:');
      const topCities = Object.entries(metrics.topCities || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      topCities.forEach(([city, count]) => {
        console.log(`  - ${city}: ${count} order(s)`);
      });

      console.log('\n📦 Product Breakdown:');
      Object.entries(metrics.productBreakdown || {}).forEach(([prod, count]) => {
        console.log(`  - ${prod}: ${count} units`);
      });
    }
  } catch (err) {
    console.warn('[Summary Warning]:', err.message);
  }

  // 2. Check if auto-retry flag is present or unpushed orders exist
  const shouldRetry = process.argv.includes('--retry-unpushed') || process.argv.includes('--sync');
  if (shouldRetry) {
    console.log('\n[2/3] Triggering Shiprocket Auto-Retry for any unpushed orders...');
    try {
      const retryRes = await fetch(`${apiUrl}/retryUnpushedShiprocketOrders`, { method: 'POST' });
      const retryData = await retryRes.json();
      console.log('• Newly Pushed to Shiprocket:', retryData.summary?.newlyPushedCount || 0);
      if (retryData.newlyPushedOrders && retryData.newlyPushedOrders.length > 0) {
        retryData.newlyPushedOrders.forEach(o => {
          console.log(`  ✓ ${o.bookingId} -> Shiprocket Order ID: ${o.shiprocketOrderId} (AWB: ${o.shiprocketAwb || 'Generating'})`);
        });
      }
    } catch (retryErr) {
      console.error('[Shiprocket Retry Error]:', retryErr.message);
    }
  }

  // 3. Download & Export Complete Excel / CSV Sheet to Local Project Root
  console.log('\n[3/3] Generating local Excel / CSV Customer Master Spreadsheet...');
  try {
    const exportRes = await fetch(`${apiUrl}/exportCustomerOrdersExcel`);
    if (exportRes.ok) {
      const csvData = await exportRes.text();
      const exportPath = path.join(process.cwd(), 'customer_orders_master.csv');
      fs.writeFileSync(exportPath, csvData, 'utf8');
      console.log(`\n🎉 SUCCESS: Full customer data saved to:`);
      console.log(`   ${exportPath}`);
      console.log(`\n💡 Tip: Double-click this CSV file to open immediately in Microsoft Excel, Apple Numbers, or Google Sheets!`);
    } else {
      console.error('Failed to download CSV export. Status:', exportRes.status);
    }
  } catch (exportErr) {
    console.error('[Export Error]:', exportErr.message);
  }

  console.log('\n===============================================================');
}

main().catch(console.error);
