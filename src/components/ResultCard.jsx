import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultCard = ({ selectedStudentId }) => {
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
    const fetchResultData = async () => {
      if (!selectedStudentId) {
        setResultData(null);
        setError('No student selected.');
        return;
      }
      console.log('Fetching data for studentId:', selectedStudentId);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://localhost:7014/api/studenttest/${selectedStudentId}/result`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data);
        setResultData(response.data);
        setError('');
      } catch (err) {
        console.error('API Error:', err);
        setError('Error fetching result data.');
        setResultData(null);
      }
    };
    fetchResultData();
  }, [selectedStudentId]);

  if (error) return <div style={styles.container}><p style={{ color: 'red' }}>{error}</p></div>;
  if (!resultData) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Provisional Result Intimation</h1>
      <h2 style={styles.subHeader}>
        Secondary School Certificate (9th Class) (First Annual) Examination, 2025
      </h2>
      <h2 style={styles.subHeader}>Group: {resultData.group || 'Science'}</h2>

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
            <td style={styles.infoCell}>{resultData.institution || 'N/A'}</td>
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
            <th style={styles.th}>{resultData.totalStatus || 'PASS'} {resultData.totalMarks || 'N/A'}</th>
          </tr>
        </tbody>
      </table>

      <div style={styles.note}>
        <p><strong>NOTE:</strong></p>
        <ol>
          <li>This provisional result intimation is issued as a notice only, errors and omissions excepted. If any discrepancy is found in the Result Intimation, contact the Board within 30 days after declaration of the result.</li>
          <li>If the result intimation is lost, interim result intimation can be obtained by the candidate on payment of prescribed fee.</li>
          <li>Candidate intending to apply for re-checking of his/her paper(s) may apply online within 15 days after declaration of the result.</li>
          <li>The student who fails or obtains less than 33% marks in one or more subjects or remains absent in Part-I Examination, may be re-admitted in Part-I with the changed/same combination of subjects/group in the same or in any other institution. However, the passed candidate will get re-admission after cancellation of his result from the Board with an undertaking on stamp paper that he never appeared in Part-II Examination. He will not be entitled for the position at any stage. Position will be right of those candidates who admitted first time in the institution.</li>
        </ol>
        <p><em>This result card is computer-generated in real time and can be verified by scanning the QR code.</em></p>
      </div>

      <div style={styles.footer}>
        <div><strong>Result Declared On:</strong><br />{resultData.resultDeclaredOn || '20 Aug 2025'}</div>
        <div style={styles.signature}>Controller of Examinations</div>
      </div>

      <div style={styles.qr}>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ResultVerificationURL" alt="QR Code" />
      </div>
    </div>
  );
};

export default ResultCard;