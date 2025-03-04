import { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Snackbar,
  Alert,
  TablePagination,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const Task = () => {
  const [tasks, setTasks] = useState([]); // State for tasks
  const [error, setError] = useState(null); // State for error
  const [searchTerm, setSearchTerm] = useState(""); // State for search filter
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [expandedTask, setExpandedTask] = useState(null); // To track which task's description is expanded
  const [loading, setLoading] = useState(false); // State for loading
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar visibility

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setSnackbarOpen(true);
        const token = localStorage.getItem("token");
        const adminEmail = localStorage.getItem("email"); // Retrieve email from localStorage

        const response = await axios.get(
          `https://work-management-cvdpavakcsa5brfb.canadacentral-01.azurewebsites.net/admin-sub/all-tasks?subAdminEmail=${adminEmail}`,
          {
            headers: {
              Authorization: token, // Add token to request headers
            },
          }
        );

        setTasks(response.data.data || []); // Fix: Use response.data.data
      } catch {
        setError("Failed to fetch tasks. Please try again."); // Handle errors
      } finally {
        setLoading(false);
        setSnackbarOpen(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search input
  const filteredTasks = tasks?.filter(
    (task) =>
      task?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page is changed
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      {/* Snackbar for loading state */}
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="info">
          Loading...
        </Alert>
      </Snackbar>

      {/* Header and Search Box */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <h2 className="text-xl font-bold">Employee Tasks</h2>
        {/* Search Input on the Right */}
        <Box sx={{ width: "400px" }}>
          <TextField
            label="Search by Name or Task"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
          />
        </Box>
      </Box>

      {/* Show loading spinner */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Show error message */}
      {error && (
        <Typography variant="body1" color="error" align="center">
          {error}
        </Typography>
      )}

      {/* Show message when no tasks are available */}
      {!loading && tasks.length === 0 && (
        <Typography variant="body1" align="center" mt={2}>
          No tasks available.
        </Typography>
      )}

      {/* Table component */}
      {!loading && tasks.length > 0 && (
        <Paper elevation={3}>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Assigned By</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.id}</TableCell>
                        <TableCell>{task.assignedBy}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>
                          {expandedTask === task.id ? (
                            <div style={{ whiteSpace: "pre-wrap" }}>
                              {task.description}
                            </div>
                          ) : (
                            <div>
                              {`${task.description?.slice(0, 100)}... `}
                              <Button onClick={() => setExpandedTask(task.id)}>
                                View More
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(task.deadLine).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{task.status}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No tasks match the search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {tasks.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </div>
  );
};

export default Task;
