import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ResultCard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedTestName, setSelectedTestName] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');


  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '40px',
      backgroundColor: '#fff',
      color: '#000',
      maxWidth: '800px',
      margin: 'auto',
    },
    header: {
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    subHeader: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      fontSize: '14px',
    },
    th: {
      border: '1px solid #000',
      padding: '8px',
      backgroundColor: '#f0f0f0',
    },
    td: {
      border: '1px solid #000',
      padding: '8px',
      textAlign: 'center',
    },
    infoTable: {
      width: '100%',
      marginBottom: '20px',
      fontSize: '14px',
    },
    infoCell: {
      border: 'none',
      padding: '4px 8px',
      textAlign: 'left',
    },
    note: {
      fontSize: '12px',
      marginTop: '30px',
    },
    footer: {
      marginTop: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
    },
    qr: {
      textAlign: 'center',
      marginTop: '10px',
    },
    signature: {
      textAlign: 'right',
      fontStyle: 'italic',
    },
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7014/api/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
        // Set the selected class name when classes are fetched and a class is selected
        if (selectedClassId) {
          const selectedClass = response.data.find(cls => cls.id === parseInt(selectedClassId));
          setSelectedClassName(selectedClass ? `${selectedClass.className} - ${selectedClass.section}` : '');
        }
      } catch (err) {
        setError('Error fetching classes.');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://localhost:7014/api/test/${selectedClassId}/tests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTests(response.data);
          setSelectedTestId(''); // Reset test selection

          // Update selected class name when class changes
          const selectedClass = classes.find(cls => cls.id === parseInt(selectedClassId));
          setSelectedClassName(selectedClass ? `${selectedClass.className} - ${selectedClass.section}` : '');
        } catch (err) {
          setError('Error fetching tests.');
        }
      };
      fetchTests();
    } else {
      setTests([]);
      setSelectedTestId('');
      
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedTestId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedTestId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data);
          setSelectedStudentId(''); // Reset student selection
          const selectedTest = tests.find(test => test.id === parseInt(selectedTestId));
          setSelectedTestName(selectedTest ? selectedTest.name : '');
        } catch (err) {
          setError('Error fetching students.');
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudentId('');
      setSelectedTestName(''); // Reset test name
    }
  }, [selectedTestId]);

  const fetchResultData = async () => {
    if (!selectedStudentId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedStudentId}/result?testId=${selectedTestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      debugger
      setResultData(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching result data.');
      setResultData(null);
    }
  };

  const exportToPDF = async () => {
    const input = document.getElementById('result-card-content');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('result_report.pdf');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('result-card-content');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Result Report</title>');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #f0f0f0; } .note { font-size: 12px; margin-top: 30px; } .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 14px; } .qr { text-align: center; margin-top: 10px; } .signature { text-align: right; font-style: italic; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={styles.container}>     
      <div className="mb-3">
        <label htmlFor="classId" className="form-label">Select Class</label>
        <select className="form-select" id="classId" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.className} - {cls.section}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="testId" className="form-label">Select Test/Exam</label>
        <select className="form-select" id="testId" value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} required disabled={!selectedClassId}>
          <option value="">Select a test</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.name} ({test.type})
            </option>

          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="studentId" className="form-label">Select Student</label>
        <select className="form-select" id="studentId" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required disabled={!selectedTestId}>
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary w-100 mb-3" onClick={fetchResultData} disabled={!selectedStudentId}>Generate Report</button>
      {resultData && (
        <div>
          <button className="btn btn-success mb-3 me-2" onClick={exportToPDF}>Download PDF</button>
          <button className="btn btn-secondary mb-3" onClick={handlePrint}>Print</button>
        </div>
      )}

      {error && <p className="text-danger text-center mb-4">{error}</p>}
      {resultData && (
        
        <div id="result-card-content">
           <h1 style={styles.header}>{resultData.institution || 'N/A'}</h1>
      <h2 style={styles.subHeader}>
        Regular Test System ({selectedClassName}) ({selectedTestName}) Examination, 2025
      </h2>
      <h2 style={styles.subHeader}>Group: Science</h2>

          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.infoCell}><strong>Name:</strong></td><td style={styles.infoCell}>{resultData.name || 'N/A'}</td>
                <td style={styles.infoCell}><strong>Roll No:</strong></td><td style={styles.infoCell}>{resultData.rollNo || 'N/A'}</td>
              </tr>
              <tr>
                <td style={styles.infoCell}><strong>Father's Name:</strong></td><td style={styles.infoCell}>{resultData.fatherName || 'N/A'}</td>
                <td style={styles.infoCell}><strong>Father's CNIC:</strong></td><td style={styles.infoCell}>{resultData.fatherCNIC || 'N/A'}</td>
              </tr>
              <tr>
                <td style={styles.infoCell}><strong>Date of Birth:</strong></td><td style={styles.infoCell}>{resultData.dateOfBirth || 'N/A'}</td>
                <td style={styles.infoCell}><strong>Institution / District:</strong></td>
                {/* <td style={styles.infoCell}>{resultData.institution || 'N/A'}</td> */}
              </tr>
            </tbody>
          </table>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name of Subject</th>
                <th style={styles.th}>Max. Marks</th>
                <th style={styles.th}>Marks Obtained</th>
                <th style={styles.th}>Relative Grade</th>
                <th style={styles.th}>Percentile Score</th>
                <th style={styles.th}>Result Status</th>
              </tr>
            </thead>
            <tbody>
              {(resultData.subjects || []).map((subjectData, index) => (
                <tr key={index}>
                  <td style={styles.td}>{subjectData.subject}</td>
                  <td style={styles.td}>{subjectData.totalMarks}</td>
                  <td style={styles.td}>{subjectData.obtainedMarks}</td>
                  <td style={styles.td}>{subjectData.grade}</td>
                  <td style={styles.td}>{subjectData.percentile}</td>
                  <td style={styles.td}>{subjectData.status || 'PASS'}</td>
                </tr>
              ))}
              <tr>
                <th style={styles.th} colSpan="5">Total</th>
                <th style={styles.th}>{resultData.totalStatus || 'PASS'} 
                  {/* {resultData.totalMarks || 'N/A'} */}
                </th>
              </tr>
            </tbody>
          </table>

          <div style={styles.note}>
            <p><strong>NOTE:</strong></p>
            <ol>
              <li>The result notification is issued for informational purposes only and is considered provisional. Any errors or omissions are excepted. If a student identifies any discrepancy in their result, they must report it to the school administration within 30 days of the result announcement.</li>
              <li>In case the original result notification is misplaced or lost, students may request a duplicate copy by submitting an application along with the prescribed fee.</li>
              <li>Students who wish to apply for rechecking of their exam papers may do so through the school's online portal within 15 days of the result declaration.</li>
              <li>Students who fail, secure less than 50% marks in one or more subjects, or remain absent from tests or examinations will not be eligible for submission of their admission to BISE Lahore.</li>
            </ol>
            <p><em>This result card is computer-generated in real time.</em></p>
          </div>

          <div style={styles.footer}>
            <div style={styles.signature}><strong>Incharge of Examinations</strong>
              {/* <br />{resultData.resultDeclaredOn || '20 Aug 2025'} */}
            </div>
            <div style={styles.signature}>Principal:</div>
          </div>

          <div style={styles.qr}>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ResultVerificationURL" alt="QR Code" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;