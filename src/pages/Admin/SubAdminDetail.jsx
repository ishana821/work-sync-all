import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Box,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateSubadmin from './CreateSubadmin';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const SubAdminDetails = () => {
  const navigate = useNavigate();



  const [subAdmins, setSubAdmins] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);


  const [showAllInfoDialogOpen, setShowAllInfoDialogOpen] = useState(false);


  const rowsPerPage = 10;

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {

        setLoading(true);
        setSnackbarOpen(true);
        const adminEmail = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://work-management-cvdpavakcsa5brfb.canadacentral-01.azurewebsites.net/admin/api/subAdmins?adminEmail=${adminEmail}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const apiData = response.data?.data || [];
        setSubAdmins(apiData);
      } catch (error) {
        console.error('Error fetching sub-admins:', error);

      } finally {
        setLoading(false);
        setSnackbarOpen(false);
      }
    };

    fetchSubAdmins();
  }, []);

  const handleCloseShowAllInfoDialog = () => {
    setShowAllInfoDialogOpen(false);
  };

  const handleApproveAccess = async (subAdmin) => {
    try {
      const adminEmail = localStorage.getItem('email');
      const token = localStorage.getItem('token');
  
      if (!adminEmail || !token) {
        console.error('Admin email or token is missing.');
        return;
      }
  
      const updatedStatus = !subAdmin.isActive;
  
      const requestBody = {
        adminEmail: adminEmail,
        subAdminEmail: subAdmin.subAdminEmail,
        approvedByAdmin: updatedStatus,
      };
  
      const response = await axios.patch(
        'https://work-management-cvdpavakcsa5brfb.canadacentral-01.azurewebsites.net/admin/api/sub-admin-access',
        requestBody,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        // Update state to reflect the new status
        setSubAdmins((prevSubAdmins) =>
          prevSubAdmins.map((admin) =>
            admin.id === subAdmin.id ? { ...admin, isActive: updatedStatus } : admin
          )
        );
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };
  

  const handleMenuOpen = (event, adminId, adminEmail, subAdmin) => {
    console.log("Sub Admin Data:", subAdmin); // Log the subAdmin data
    setAnchorEl(event.currentTarget);
    setSelectedAdminId(adminId);
    setSelectedAdminEmail(adminEmail);
    setSelectedEmployee(subAdmin);
  };


  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdminId(null);
    setSelectedAdminEmail('');
  };

  const handleMenuAction = (action) => {
    if (action === 'Leave') {
      navigate(`/admin/${selectedAdminId}/leave?email=${selectedAdminEmail}`);
    } else if (action === 'Attendance') {
      navigate(`/admin/${selectedAdminId}/attendance?email=${selectedAdminEmail}`);
    } else if (action === 'showAllInfoedit') {
      setShowAllInfoDialogOpen(true);
    }

    handleMenuClose();
  };

  console.log(selectedEmployee)



  const filteredSubAdmins = subAdmins.filter(subAdmin =>
    subAdmin.subAdminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subAdmin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (page - 1) * rowsPerPage;
  const paginatedSubAdmins = filteredSubAdmins.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setPage((prev) => (prev * rowsPerPage < filteredSubAdmins.length ? prev + 1 : prev));

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  if (loading) {
    return (
      <>
        <Snackbar
          open={snackbarOpen}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
            Loading
          </Alert>
        </Snackbar>
      </>
    )
  }
  return (
    <div className="p-6">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Sub Admin Details
        </Typography>
        <div className='flex items-center gap-3'> 

        <CreateSubadmin />
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '400px' }}
          />
          </div>
      </Box>
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                <TableCell style={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Joining Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Access</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubAdmins.length > 0 ? (
                paginatedSubAdmins.map((subAdmin, index) => (
                  <TableRow key={subAdmin.id}>
                    <TableCell>{++index}</TableCell>
                    <TableCell>{subAdmin.subAdminAssignedUserEmail}</TableCell>
                    <TableCell>{subAdmin.subAdminEmail}</TableCell>
                    <TableCell>{subAdmin.role}</TableCell>
                    <TableCell>{subAdmin.joiningDate}</TableCell>
                    <TableCell>
                      {subAdmin.approvedByAdmin ? (
                        <Typography color="green">Approved</Typography>
                      ) : (
                        <Typography color="red">Not Approved</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color={subAdmin.approvedByAdmin? 'secondary' : 'primary'}
                        onClick={() => handleApproveAccess(subAdmin)}

                      >
                        {subAdmin.approvedByAdmin ? 'Remove Access' : 'Approve Access'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(event) => handleMenuOpen(event, subAdmin.id, subAdmin.subAdminAssignedUserEmail, subAdmin)}
                      >
                        <MoreVertIcon />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedAdminId === subAdmin.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleMenuAction('showAllInfoedit')}>Show All Info</MenuItem>
                        <MenuItem onClick={() => handleMenuAction('Leave')}>Leave</MenuItem>
                        <MenuItem onClick={() => handleMenuAction('Attendance')}>Attendance</MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No sub-admins match the search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2 }}>
        <Button variant="outlined" onClick={handlePrevPage} disabled={page === 1}>
          Prev
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={page * rowsPerPage >= filteredSubAdmins.length}
        >
          Next
        </Button>
      </Box>




      {/* Dialog to Show All Employee Information */}
      <Dialog open={showAllInfoDialogOpen} onClose={handleCloseShowAllInfoDialog}>
        <DialogTitle>Employee Information</DialogTitle>
        <DialogContent>
          {selectedEmployee ? (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell>{selectedEmployee.id || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell>{selectedEmployee.name || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell>{selectedEmployee.email || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Mobile</strong></TableCell>
                    <TableCell>{selectedEmployee.mobileNo || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell>{selectedEmployee.role || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>DOB</strong></TableCell>
                    <TableCell>{selectedEmployee.dob || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Current Address</strong></TableCell>
                    <TableCell>{selectedEmployee.addressDetails?.currentAddress || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Permanent Address</strong></TableCell>
                    <TableCell>{selectedEmployee.addressDetails?.permanentAddress || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Emergency Contacts</strong></TableCell>
                    <TableCell>
                      {selectedEmployee.emergencyContactDetails?.length > 0 ? (
                        selectedEmployee.emergencyContactDetails.map((contact, index) => (
                          <div key={index}>
                            {contact.relation}: {contact.emergencyContactName} ({contact.emergencyContactNo})
                          </div>
                        ))
                      ) : (
                        'Not Available'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableCell colSpan={2}>
                    <strong>Leave: </strong>
                  </TableCell>
                  <TableRow>
                    <TableCell><strong>Sick Leave</strong></TableCell>
                    <TableCell>{selectedEmployee.allLeaves?.sickLeave || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Casual Leave</strong></TableCell>
                    <TableCell>{selectedEmployee.allLeaves?.casualLeave || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Paternity Leave</strong></TableCell>
                    <TableCell>{selectedEmployee.allLeaves?.paternity || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Optional Leave</strong></TableCell>
                    <TableCell>{selectedEmployee.allLeaves?.optionalLeave || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <strong>Bank Details: </strong>
                    </TableCell>
                  </TableRow>


                  <TableRow>
                    <TableCell><strong>Account Holder Name</strong></TableCell>
                    <TableCell>{selectedEmployee.bankDetails?.accountHolderName || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Account Type</strong></TableCell>
                    <TableCell>{selectedEmployee.bankDetails?.accountType || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Account Number</strong></TableCell>
                    <TableCell>{selectedEmployee.bankDetails?.accountNumber || 'Not Available'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>IFSC Code</strong></TableCell>
                    <TableCell>{selectedEmployee.bankDetails?.ifscCode || 'Not Available'}</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="error">No employee data available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShowAllInfoDialog}>Close</Button>
        </DialogActions>
      </Dialog>



    </div>
  );
};

export default SubAdminDetails;
