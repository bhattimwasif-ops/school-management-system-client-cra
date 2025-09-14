const [allStudents, setAllStudents] = useState(false);
const [results, setResults] = useState([]);

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:32000/api/test/${selectedTestId}/marks`, {
      params: { studentId: allStudents ? null : selectedStudentId },
      headers: { Authorization: `Bearer ${token}` },
    });
    setResults(response.data);
  } catch (err) {
    setError('Error searching marks.');
  }
};

// Add toggle checkbox
<div className="form-check mb-3">
  <input className="form-check-input" type="checkbox" id="allStudents" checked={allStudents} onChange={(e) => setAllStudents(e.target.checked)} />
  <label className="form-check-label" htmlFor="allStudents">All Students</label>
</div>
{!allStudents && (
  <select className="form-select mb-3" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
    <option value="">Select Student</option>
    {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
  </select>
)}