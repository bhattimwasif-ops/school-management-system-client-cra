import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot, unstable_batchedUpdates } from 'react-dom'; // Import unstable_batchedUpdates
import BASE_URL from './config';
import schoolLogo from '../school-logo.png'; // Static import

function StudentResultViewAndDownload() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [error, setError] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedTestName, setSelectedTestName] = useState('');
  const [resultDataCache, setResultDataCache] = useState({}); // Cache result data by studentId
  const pdfContentRef = useRef(null); // Ref for PDF content rendering
  const [logoSrc, setLogoSrc] = useState(schoolLogo); // Local state for logo
  const [isRendered, setIsRendered] = useState(false); // State to track rendering

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
      } catch (err) {
        setError('Error fetching classes.');
      }
    };
    fetchClasses();

    const img = new Image();
    img.src = schoolLogo;
    img.onload = () => {
      console.log('Logo preloaded');
      setLogoSrc(schoolLogo);
    };
    img.onerror = () => {
      console.error('Logo failed to load');
      setLogoSrc('');
    };
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchTests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/api/test/${selectedClassId}/tests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTests(response.data);
          setSelectedTestId('');
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
      setSelectedClassName('');
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (selectedTestId) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${BASE_URL}/api/studenttest/${selectedTestId}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(response.data);
        } catch (err) {
          setError('Error fetching students.');
        }
      };
      fetchStudents();

      const selectedTest = tests.find(test => test.id === parseInt(selectedTestId));
      setSelectedTestName(selectedTest ? selectedTest.name : '');
    } else {
      setStudents([]);
      setSelectedTestName('');
    }
  }, [selectedTestId, tests]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const fetchResultData = async (studentId) => {
    if (!resultDataCache[studentId] && selectedTestId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/studenttest/${studentId}/result?testId=${selectedTestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResultDataCache((prev) => ({ ...prev, [studentId]: response.data }));
      } catch (err) {
        setError(`Error fetching result for student ID ${studentId}.`);
        console.error(err);
      }
    }
  };

  const downloadPDF = async (studentId) => {
    await fetchResultData(studentId);
    const resultData = resultDataCache[studentId];

    if (!resultData) {
      setError('Result data not available.');
      return;
    }

    pdfContentRef.current.innerHTML = '';
    const contentDiv = document.createElement('div');
    contentDiv.style.width = '800px';
    contentDiv.style.boxSizing = 'border-box';
    contentDiv.style.position = 'absolute';
    contentDiv.style.top = '-9999px'; // Off-screen instead of display: none
    contentDiv.style.left = '0';
    pdfContentRef.current.appendChild(contentDiv);

    const root = createRoot(contentDiv);
    setIsRendered(false); // Reset rendering state
    unstable_batchedUpdates(() => {
      root.render(
        <div id="result-card-content">
          <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', backgroundColor: '#fff', color: '#000', maxWidth: '800px', margin: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
              <img src={logoSrc} alt="School Logo" style={{ maxWidth: '120px', height: 'auto', marginBottom: '5px' }} />
              <h4 style={{ textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', color: '#333' }}>
                <b>{resultData.institution || 'N/A'}</b>
              </h4>
            </div>
            <h4 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
              <b>({selectedClassName}) ({selectedTestName}), 2025 - 2026</b>
            </h4>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', color: '#555' }}></h2>

            <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Name:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.name || 'N/A'}</td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Roll No:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.rollNo || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Father's Name:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.fatherName || 'N/A'}</td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Father's CNIC:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.fatherCNIC || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Date of Birth:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.dateOfBirth || 'N/A'}</td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Institution / District:</strong></td>
                  <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultData.institution || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Name of Subject</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Max. Marks</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Marks Obtained</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Relative Grade</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Percentile Score</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Result Status</th>
                </tr>
              </thead>
              <tbody>
                {(resultData.subjects || []).map((subjectData, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.subject}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.totalMarks}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.obtainedMarks}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.grade}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.percentile}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.status || 'PASS'}</td>
                  </tr>
                ))}
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }} colSpan="5">Total</th>
                  <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>{resultData.totalStatus || 'PASS'}</th>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: '12px', marginTop: '30px' }}>
              <p><strong>NOTE:</strong></p>
              <ol>
                <li>The result notification is issued for informational purposes only and is considered provisional. Any errors or omissions are excepted. If a student identifies any discrepancy in their result, they must report it to the school administration within 30 days of the result announcement.</li>
                <li>In case the original result notification is misplaced or lost, students may request a duplicate copy by submitting an application along with the prescribed fee.</li>
                <li>Students who wish to apply for rechecking of their exam papers may do so through the school's online portal within 15 days of the result declaration.</li>
                <li>Students who fail, secure less than 50% marks in one or more subjects, or remain absent from tests or examinations will not be eligible for submission of their admission to BISE Lahore.</li>
              </ol>
              <p><em>This result card is computer-generated in real time.</em></p>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <div style={{ textAlign: 'right', fontStyle: 'italic' }}><strong>Incharge of Examinations</strong></div>
              <div style={{ textAlign: 'right', fontStyle: 'italic' }}>Principal:</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ResultVerificationURL" alt="QR Code" />
            </div>
          </div>
        </div>,
        () => setIsRendered(true) // Callback when render is complete
      );
    });

    // Wait for rendering to complete
    await new Promise(resolve => {
      const checkRender = () => {
        if (isRendered) resolve();
        else setTimeout(checkRender, 100);
      };
      checkRender();
    });

    console.log('Rendered HTML:', contentDiv.innerHTML.substring(0, 100) + '...');
    const canvas = await html2canvas(pdfContentRef.current, {
      scale: 2,
      useCORS: true,
      width: 800,
      windowWidth: 800,
      logging: true,
      onclone: (clonedDoc) => {
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (img.src === schoolLogo) img.src = logoSrc;
          else img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ResultVerificationURL';
        });
      },
    });
    const imgData = canvas.toDataURL('image/png');
    console.log('Image Data URL:', imgData.substring(0, 50) + '...');
    if (!imgData.startsWith('data:image/png;base64,')) {
      setError('Invalid image data generated.');
      root.unmount();
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pdfWidth = 210;
    const pdfHeight = pdf.internal.pageSize.getHeight(); // Use getHeight for A4
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight, undefined, 'FAST');
    pdf.save(`${resultData.name || 'Student'}_${selectedTestName}_result.pdf`);

    root.unmount();
    pdfContentRef.current.innerHTML = '';
  };

  const viewResult = async (studentId) => {
    await fetchResultData(studentId);
    setSelectedStudentForView(studentId);
    setShowViewModal(true);
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Student Result Grid</h2>
      <div className="mb-3">
        <label htmlFor="classId" className="form-label">Select Class</label>
        <select
          className="form-select"
          id="classId"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.className} - {cls.section}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="testId" className="form-label">Select Test</label>
        <select
          className="form-select"
          id="testId"
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          disabled={!selectedClassId}
        >
          <option value="">Select Test</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTestId && students.length > 0 && (
        <div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>
                  <Form.Check type="checkbox" onChange={handleSelectAll} />
                </th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                  </td>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => viewResult(student.id)}>
                      View
                    </Button>
                    <Button variant="success" size="sm" className="ms-2" onClick={() => downloadPDF(student.id)}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="primary" onClick={() => {}} disabled={selectedStudents.length === 0}>
            Download Selected
          </Button>
          <Button variant="primary" className="ms-2" onClick={() => {}}>
            Download All
          </Button>
        </div>
      )}

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudentForView && resultDataCache[selectedStudentForView] && (
            <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', backgroundColor: '#fff', color: '#000', maxWidth: '800px', margin: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <img src={logoSrc} alt="School Logo" style={{ maxWidth: '120px', height: 'auto', marginBottom: '5px' }} />
                <h4 style={{ textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', color: '#333' }}>
                  <b>{resultDataCache[selectedStudentForView].institution || 'N/A'}</b>
                </h4>
              </div>
              <h4 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                <b>({selectedClassName}) ({selectedTestName}), 2025 - 2026</b>
              </h4>
              <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', color: '#555' }}></h2>

              <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Name:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].name || 'N/A'}</td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Roll No:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].rollNo || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Father's Name:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].fatherName || 'N/A'}</td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Father's CNIC:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].fatherCNIC || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Date of Birth:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].dateOfBirth || 'N/A'}</td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}><strong>Institution / District:</strong></td>
                    <td style={{ border: 'none', padding: '4px 8px', textAlign: 'left' }}>{resultDataCache[selectedStudentForView].institution || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Name of Subject</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Max. Marks</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Marks Obtained</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Relative Grade</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Percentile Score</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(resultDataCache[selectedStudentForView].subjects || []).map((subjectData, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.subject}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.totalMarks}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.obtainedMarks}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.grade}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.percentile}</td>
                      <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{subjectData.status || 'PASS'}</td>
                    </tr>
                  ))}
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }} colSpan="5">Total</th>
                    <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0', textAlign: 'center', verticalAlign: 'middle' }}>{resultDataCache[selectedStudentForView].totalStatus || 'PASS'}</th>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '12px', marginTop: '30px' }}>
                <p><strong>NOTE:</strong></p>
                <ol>
                  <li>The result notification is issued for informational purposes only and is considered provisional. Any errors or omissions are excepted. If a student identifies any discrepancy in their result, they must report it to the school administration within 30 days of the result announcement.</li>
                  <li>In case the original result notification is misplaced or lost, students may request a duplicate copy by submitting an application along with the prescribed fee.</li>
                  <li>Students who wish to apply for rechecking of their exam papers may do so through the school's online portal within 15 days of the result declaration.</li>
                  <li>Students who fail, secure less than 50% marks in one or more subjects, or remain absent from tests or examinations will not be eligible for submission of their admission to BISE Lahore.</li>
                </ol>
                <p><em>This result card is computer-generated in real time.</em></p>
              </div>

              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <div style={{ textAlign: 'right', fontStyle: 'italic' }}><strong>Incharge of Examinations</strong></div>
                <div style={{ textAlign: 'right', fontStyle: 'italic' }}>Principal:</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ResultVerificationURL" alt="QR Code" />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <div ref={pdfContentRef} style={{ position: 'absolute', top: '-9999px', left: '0' }}></div>
    </div>
  );
}

export default StudentResultViewAndDownload;