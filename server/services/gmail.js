import axios from 'axios';

/**
 * Parses Gmail headers to retrieve specific header value by key
 * @param {Array} headers - List of header objects
 * @param {string} name - Key of the header
 * @returns {string} Header value or empty string
 */
const getHeaderValue = (headers, name) => {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
};

/**
 * Recursively parses Gmail message body parts and decodes base64url content
 * @param {Object} part - Gmail message payload part
 * @returns {string} Plain text content
 */
const getMessageBody = (part) => {
  let body = '';

  if (part.mimeType === 'text/plain' && part.body && part.body.data) {
    body += Buffer.from(part.body.data, 'base64url').toString('utf8');
  } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
    // Read html body and strip tags later
    body += Buffer.from(part.body.data, 'base64url').toString('utf8');
  } else if (part.parts && part.parts.length > 0) {
    for (const subPart of part.parts) {
      body += getMessageBody(subPart);
    }
  }

  return body;
};

// Mock emails list for developer offline/bypass testing
const mockEmails = [
  {
    id: 'mock-email-101',
    subject: 'Microsoft On-Campus Placement: Interview Shortlist & Schedule',
    from: 'University Placement Cell <placements@university.edu>',
    date: 'Fri, 10 Jul 2026 10:30:00 GMT',
    body: `Dear Shortlisted Candidates,

Congratulations! You have been shortlisted for the technical interview rounds with Microsoft.
The interview process will take place virtually.

Details:
Event: Technical Interview Round 1
Date: 12 July 2026
Time: 10:00 AM
Platform: Microsoft Teams

Please ensure you have submitted your updated resume and portfolio links on our portal by tomorrow, 11 July at 5 PM.
Failure to submit will lead to disqualification.

Best regards,
Placement Cell Coordinator`
  },
  {
    id: 'mock-email-102',
    subject: 'URGENT: Assignment 3 submission extension - CS302 Systems',
    from: 'Prof. John Doe <johndoe@university.edu>',
    date: 'Thu, 09 Jul 2026 14:15:00 GMT',
    body: `Hello Students,

Based on several requests, I have extended the deadline for Assignment 3: CPU Scheduler Implementation.
The new deadline is 15 July 2026 at 11:59 PM.

Please upload your C/C++ files and report as a single ZIP folder to the LMS. No submissions will be accepted after this date.

Thanks,
Prof John`
  },
  {
    id: 'mock-email-103',
    subject: 'Outstanding Semester Tuition Fee Reminder - Final Notice',
    from: 'Finance Office Accounts <finance@university.edu>',
    date: 'Mon, 06 Jul 2026 09:00:00 GMT',
    body: `Dear Student,

This is a reminder that your tuition and library fee for the upcoming Semester 5 is outstanding.
Amount Due: $2,400.00
Due Date: 20 July 2026

Please pay online via the student portal or deposit a demand draft at the finance office bank desk before the due date to avoid a late fee surcharge of $100.

Sincerely,
Accounts Department`
  }
];

/**
 * Fetch list of relevant emails from Gmail API or return mock list
 * @param {string} accessToken - Google OAuth Access Token
 * @param {boolean} useMock - Whether to fallback to simulated emails
 * @returns {Promise<Array>} List of email details
 */
export const fetchInboxEmails = async (accessToken, useMock = false) => {
  if (useMock || !accessToken) {
    console.log('[Gmail Service] Using local Mock Inbox emails...');
    return mockEmails;
  }

  try {
    console.log('[Gmail Service] Fetching recent emails from Gmail API (last 7 days)...');
    
    // Dynamic date filter (last 7 days) to ignore old clutter emails and prevent Gemini rate limits
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const yyyy = sevenDaysAgo.getFullYear();
    const mm = String(sevenDaysAgo.getMonth() + 1).padStart(2, '0');
    const dd = String(sevenDaysAgo.getDate()).padStart(2, '0');
    const dateFilter = `after:${yyyy}/${mm}/${dd}`;
    
    const searchParam = `subject:(deadline OR placement OR assignment OR exam OR bill OR schedule OR interview OR due) ${dateFilter}`;
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchParam)}&maxResults=5`;

    const listResponse = await axios.get(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const messages = listResponse.data.messages || [];
    console.log(`[Gmail Service] Found ${messages.length} matching emails.`);

    const emailDetails = [];
    for (const msg of messages) {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
      const detailResponse = await axios.get(detailUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const payload = detailResponse.data.payload;
      const headers = payload.headers;

      const subject = getHeaderValue(headers, 'Subject') || 'No Subject';
      const from = getHeaderValue(headers, 'From') || 'Unknown';
      const date = getHeaderValue(headers, 'Date') || '';
      
      console.log(`[Gmail Service] Retaining email: "${subject}" from ${from}`);

      let rawBody = getMessageBody(payload);
      // Strip HTML tags for AI processing
      const cleanBody = rawBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      emailDetails.push({
        id: msg.id,
        subject,
        from,
        date,
        body: cleanBody
      });
    }

    return emailDetails;
  } catch (error) {
    console.error('[Gmail Service] Gmail API call failed:', error.message);
    throw new Error(`Failed to fetch from Gmail: ${error.message}`);
  }
};
