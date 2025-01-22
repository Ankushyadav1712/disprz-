import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Grid,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { addUser, removeUser, createSurvey, assignSurvey, getAllSurveys, getSurveyResponses } from '../services/localStorage';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [surveyData, setSurveyData] = useState({
    name: '',
    questions: []
  });
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
    const userList = Object.entries(storedUsers)
      .filter(([id]) => id !== 'admin')
      .map(([id]) => id);
    setUsers(userList);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleAddUser = () => {
    setShowValidation(true);
    
    if (!newUserId || !newUserPassword) {
      return;
    }

    if (addUser(newUserId, newUserPassword)) {
      setUsers(prev => [...prev, newUserId]);
      setNewUserId('');
      setNewUserPassword('');
      setShowValidation(false);
      setSnackbar({ open: true, message: 'User added successfully' });
    } else {
      setSnackbar({ open: true, message: 'User ID already exists' });
    }
  };

  const handleRemoveUser = (userId) => {
    if (removeUser(userId)) {
      setUsers(prev => prev.filter(id => id !== userId));
      setSnackbar({ open: true, message: 'User removed successfully' });
    } else {
      setSnackbar({ open: true, message: 'Cannot remove user' });
    }
  };

  const handleCreateSurvey = () => {
    setShowValidation(true);

    if (!surveyData.name || surveyData.questions.length === 0 || surveyData.questions.some(q => !q.text)) {
      return;
    }

    const survey = {
      id: Date.now().toString(),
      ...surveyData
    };
    createSurvey(survey);
    setSurveyData({ name: '', questions: [] });
    setShowValidation(false);
    setSnackbar({ open: true, message: 'Survey created successfully' });
  };

  const handleAssignSurvey = () => {
    if (assignSurvey(selectedSurvey.id, assignUserId)) {
      setSnackbar({ open: true, message: 'Survey assigned successfully' });
      setAssignUserId('');
    } else {
      setSnackbar({ open: true, message: 'User already has an open survey' });
    }
  };

  const addQuestion = (type) => {
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        type,
        text: '',
        ...(type === 'rating' ? { min: 1, max: 5 } : {})
      }]
    }));
  };

  const getAvailableUsers = () => {
    const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
    return users.filter(userId => {
      const hasOpenSurvey = Object.values(assignments).some(
        assignment => assignment.userId === userId && !assignment.completed
      );
      return !hasOpenSurvey;
    });
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
              alt="Survey Icon" 
              style={{ height: '40px', marginRight: '16px' }}
            />
            <Typography variant="h6" component="div">
              Survey Management System - Admin Dashboard
            </Typography>
          </Box>
          <Button 
            color="error" 
            variant="contained" 
            onClick={handleLogout}
            sx={{ bgcolor: '#d32f2f' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tab} 
            onChange={(e, newValue) => {
              setTab(newValue);
              setShowValidation(false);
            }}
            sx={{
              bgcolor: '#f5f5f5',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab label="User Management" />
            <Tab label="Survey Management" />
            <Tab label="View Surveys" />
          </Tabs>

          <Box p={4}>
            {tab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Add New User</Typography>
                    <TextField
                      label="User ID"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      margin="normal"
                      fullWidth
                      error={showValidation && !newUserId}
                      helperText={showValidation && !newUserId ? 'User ID is required' : ''}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      margin="normal"
                      fullWidth
                      error={showValidation && !newUserPassword}
                      helperText={showValidation && !newUserPassword ? 'Password is required' : ''}
                    />
                    <Button 
                      onClick={handleAddUser} 
                      variant="contained" 
                      sx={{ mt: 2, bgcolor: '#2e7d32' }}
                      fullWidth
                    >
                      Add User
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>User List</Typography>
                    <List>
                      {users.map((userId) => (
                        <React.Fragment key={userId}>
                          <ListItem>
                            <ListItemText primary={userId} />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                onClick={() => handleRemoveUser(userId)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Create Survey</Typography>
                <TextField
                  label="Survey Name"
                  value={surveyData.name}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, name: e.target.value }))}
                  margin="normal"
                  fullWidth
                  error={showValidation && !surveyData.name}
                  helperText={showValidation && !surveyData.name ? 'Survey name is required' : ''}
                />
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Button onClick={() => addQuestion('rating')} variant="outlined" sx={{ mr: 2 }}>
                    Add Rating Question
                  </Button>
                  <Button onClick={() => addQuestion('text')} variant="outlined">
                    Add Text Question
                  </Button>
                </Box>

                {surveyData.questions.map((question, index) => (
                  <Paper key={question.id} sx={{ p: 2, mt: 2 }}>
                    <TextField
                      label={`Question ${index + 1}`}
                      value={question.text}
                      onChange={(e) => {
                        const newQuestions = [...surveyData.questions];
                        newQuestions[index].text = e.target.value;
                        setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                      }}
                      fullWidth
                      error={showValidation && !question.text}
                      helperText={showValidation && !question.text ? 'Question text is required' : ''}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Type: {question.type}
                      {question.type === 'rating' && ' (1-5)'}
                    </Typography>
                  </Paper>
                ))}

                <Button
                  onClick={handleCreateSurvey}
                  variant="contained"
                  sx={{ mt: 3 }}
                >
                  Create Survey
                </Button>
              </Box>
            )}

            {tab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Surveys</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <List>
                        {Object.values(getAllSurveys()).map(survey => (
                          <ListItem 
                            key={survey.id} 
                            button 
                            onClick={() => setSelectedSurvey(survey)}
                            selected={selectedSurvey?.id === survey.id}
                          >
                            <ListItemText primary={survey.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    {selectedSurvey && (
                      <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Assign Survey</Typography>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Select User</InputLabel>
                          <Select
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            label="Select User"
                          >
                            {getAvailableUsers().map(userId => (
                              <MenuItem key={userId} value={userId}>{userId}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button 
                          onClick={handleAssignSurvey} 
                          variant="contained" 
                          sx={{ mt: 2 }}
                          disabled={!assignUserId}
                        >
                          Assign Survey
                        </Button>

                        <Typography variant="h6" sx={{ mt: 4 }}>Survey Responses</Typography>
                        <List>
                          {getSurveyResponses(selectedSurvey.id).map((response, index) => (
                            <Paper key={index} sx={{ p: 2, mt: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                User: {response.userId}
                              </Typography>
                              {Object.entries(response.answers).map(([questionId, answer]) => (
                                <Typography key={questionId} variant="body2" sx={{ mt: 1 }}>
                                  <strong>
                                    {selectedSurvey.questions.find(q => q.id === parseInt(questionId)).text}:
                                  </strong>
                                  {' '}{answer}
                                </Typography>
                              ))}
                            </Paper>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
}

export default AdminDashboard;