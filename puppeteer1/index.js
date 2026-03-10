import puppeteer from 'puppeteer';

// Your test credentials
const CREDENTIALS = {
  classId: 'CI201',
  studentId: '23CI2010277', // Replace with your actual ID
  password: '87654321'   // Replace with your actual password
};

(async () => {
  console.log('🚀 Starting SVGU ERP Scraper...');
  
  // Launch browser with visible mode for testing
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for production
    slowMo: 100,    // Slow down for testing
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Set viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('📝 Step 1: Navigating to login page...');
    
    // Navigate to login page
    await page.goto('https://svguica.svguerp.in/studentinfosys/studentportal/studinfo_studlogin.aspx', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    console.log('🔐 Step 2: Logging in...');
    
    // Wait for login form to load
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Fill login form based on ASP.NET structure
    // From the attendance page, we can see the field names
    await page.type('input[name="ctl00$MainContent$TextBox1"]', CREDENTIALS.classId);
    await page.type('input[name="ctl00$MainContent$TextBox2"]', CREDENTIALS.studentId);
    await page.type('input[name="ctl00$MainContent$TextBox3"]', CREDENTIALS.password);
    
    // Click login button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('input[name="ctl00$MainContent$Button1"]')
    ]);
    
    console.log('✅ Login successful! Current URL:', page.url());
    
    console.log('📊 Step 3: Navigating to attendance page...');
    
    // Navigate to attendance page (direct URL since we have it)
    const attendanceUrl = `https://svguica.svguerp.in/studentinfosys/studentportal/studinfo_attendance.aspx?Instid=CI201%3f${CREDENTIALS.studentId}%3fCI201-BCA-SEM-V%3f%3f${CREDENTIALS.studentId}`;
    
    await page.goto(attendanceUrl, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    console.log('🔍 Step 4: Checking if "Show" button click is needed...');
    
    // Check if we need to click "Show" button to load data
    const showButton = await page.$('input[name="ctl00$MainContent$Button2"]');
    if (showButton) {
      console.log('📋 Clicking "Show" button to load attendance data...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        showButton.click()
      ]);
    }
    
    console.log('📈 Step 5: Extracting attendance data...');
    
    // Wait for the attendance table to load
    await page.waitForSelector('#MainContent_GridView2', { timeout: 10000 });
    
    // Extract attendance data from the table
    const attendanceData = await page.evaluate((studentId) => {
      const table = document.querySelector('#MainContent_GridView2');
      if (!table) return null;
      
      const rows = table.querySelectorAll('tr');
      const data = {
        studentInfo: {},
        subjects: [],
        summary: {}
      };
      
      // Find the data row for our student
      let studentRow = null;
      for (let i = 2; i < rows.length; i++) { // Skip header rows (0,1)
        const firstCell = rows[i].querySelector('td');
        if (firstCell && firstCell.textContent.trim() === studentId) {
          studentRow = rows[i];
          break;
        }
      }
      
      if (!studentRow) return null;
      
      const cells = studentRow.querySelectorAll('td');
      
      // Extract student info
      data.studentInfo = {
        rollNo: cells[0]?.textContent?.trim() || '',
        name: cells[1]?.textContent?.trim() || ''
      };
      
      // Extract subject-wise data
      // Based on the HTML structure, subjects start from index 2
      const subjectNames = [
        'Search Engine Marketing (2320102351)',
        'Web Development using ASP .net (C#) (2320103351)', 
        'Python Programming (2320103352)',
        'Career Development Skills (2320109351)',
        'Data Science (2320110351)'
      ];
      
      let cellIndex = 2; // Start after Roll No and Name
      
      subjectNames.forEach((subjectName) => {
        const present = parseInt(cells[cellIndex]?.textContent?.trim() || '0');
        const total = parseInt(cells[cellIndex + 1]?.textContent?.trim() || '0');
        const percentage = parseFloat(cells[cellIndex + 2]?.textContent?.trim() || '0');
        
        data.subjects.push({
          name: subjectName,
          present,
          total,
          percentage
        });
        
        cellIndex += 3; // Move to next subject (Present, Total, %)
      });
      
      // Extract summary data (last few columns)
      const totalPresentIndex = cells.length - 9; // Based on table structure
      data.summary = {
        totalPresent: parseInt(cells[totalPresentIndex]?.textContent?.trim() || '0'),
        totalLectures: parseInt(cells[totalPresentIndex + 1]?.textContent?.trim() || '0'),
        averagePercentage: parseFloat(cells[totalPresentIndex + 2]?.textContent?.trim() || '0'),
        extraEntered: parseInt(cells[totalPresentIndex + 3]?.textContent?.trim() || '0'),
        extraPercentage: parseFloat(cells[totalPresentIndex + 4]?.textContent?.trim() || '0'),
        extraConsidered: parseInt(cells[totalPresentIndex + 5]?.textContent?.trim() || '0'),
        withExtraPresent: parseInt(cells[totalPresentIndex + 6]?.textContent?.trim() || '0'),
        withExtraPercentage: parseFloat(cells[totalPresentIndex + 7]?.textContent?.trim() || '0')
      };
      
      return data;
    }, CREDENTIALS.studentId);
    
    console.log('🎉 Step 6: Data extraction complete!');
    
    if (attendanceData) {
      console.log('\n📋 ATTENDANCE REPORT');
      console.log('='.repeat(50));
      console.log(`Student: ${attendanceData.studentInfo.name}`);
      console.log(`Roll No: ${attendanceData.studentInfo.rollNo}`);
      console.log(`Overall Attendance: ${attendanceData.summary.averagePercentage}%`);
      console.log(`Total Present: ${attendanceData.summary.totalPresent}/${attendanceData.summary.totalLectures}`);
      
      console.log('\n📚 SUBJECT-WISE ATTENDANCE:');
      console.log('-'.repeat(50));
      attendanceData.subjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.name.split('(')[0].trim()}`);
        console.log(`   Present: ${subject.present}/${subject.total} (${subject.percentage}%)`);
      });
      
      // Save to file for testing
      const fs = await import('fs');
      const filename = `attendance_${CREDENTIALS.studentId}_${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(filename, JSON.stringify(attendanceData, null, 2));
      console.log(`\n💾 Data saved to: ${filename}`);
      
      // Check for low attendance alert
      if (attendanceData.summary.averagePercentage < 75) {
        console.log('\n🚨 ALERT: Your attendance is below 75%!');
        console.log(`Current: ${attendanceData.summary.averagePercentage}%`);
        
        // Calculate classes needed
        const currentPresent = attendanceData.summary.totalPresent;
        const currentTotal = attendanceData.summary.totalLectures;
        const classesNeeded = Math.ceil((75 * currentTotal - 100 * currentPresent) / 25);
        
        if (classesNeeded > 0) {
          console.log(`You need to attend ${classesNeeded} more classes to reach 75%`);
        }
      } else {
        console.log(`\n✅ Good! Your attendance (${attendanceData.summary.averagePercentage}%) is above 75%`);
      }
      
    } else {
      console.log('❌ Could not extract attendance data. Please check the selectors.');
    }
    
  } catch (error) {
    console.error('💥 Error occurred:', error.message);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as: error_screenshot.png');
    
    // Save page HTML for debugging
    const html = await page.content();
    const fs = await import('fs');
    fs.writeFileSync('error_page.html', html);
    console.log('📄 Page HTML saved as: error_page.html');
    
  } finally {
    console.log('\n🏁 Closing browser...');
    await browser.close();
    console.log('✅ Scraping completed!');
  }
})();

// Additional utility functions for future use
export class SVGUAttendanceScraper {
  constructor(credentials) {
    this.credentials = credentials;
    this.browser = null;
    this.page = null;
  }
  
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }
  
  async login() {
    await this.page.goto('https://svguica.svguerp.in/studentinfosys/studentportal/studinfo_studlogin.aspx', {
      waitUntil: 'networkidle2'
    });
    
    await this.page.type('input[name="ctl00$MainContent$TextBox1"]', this.credentials.classId);
    await this.page.type('input[name="ctl00$MainContent$TextBox2"]', this.credentials.studentId);
    await this.page.type('input[name="ctl00$MainContent$TextBox3"]', this.credentials.password);
    
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
      this.page.click('input[name="ctl00$MainContent$Button1"]')
    ]);
  }
  
  async getAttendance() {
    const attendanceUrl = `https://svguica.svguerp.in/studentinfosys/studentportal/studinfo_attendance.aspx?Instid=CI201%3f${this.credentials.studentId}%3fCI201-BCA-SEM-V%3f%3f${this.credentials.studentId}`;
    
    await this.page.goto(attendanceUrl, { waitUntil: 'networkidle2' });
    
    // Click "Show" if needed
    const showButton = await this.page.$('input[name="ctl00$MainContent$Button2"]');
    if (showButton) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
        showButton.click()
      ]);
    }
    
    return await this.page.evaluate((studentId) => {
      // Same evaluation logic as above
      // ... (attendance extraction code)
    }, this.credentials.studentId);
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}