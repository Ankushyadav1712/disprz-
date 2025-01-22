import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
} from '@mui/material';
import { getUserSurveys, submitSurvey } from '../services/localStorage';

function UserDashboard() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    setSurveys(getUserSurveys(currentUser.id));
  }, [currentUser.id]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    if (submitSurvey(currentSurvey.surveyId, currentUser.id, answers)) {
      alert('Survey submitted successfully');
      setSurveys(getUserSurveys(currentUser.id));
      setCurrentSurvey(null);
      setAnswers({});
    }
  };

  const openSurvey = surveys.find(s => !s.completed);
  const completedSurveys = surveys.filter(s => s.completed);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Paper sx={{ mt: 3, p: 3 }}>
          {!currentSurvey && (
            <Box>
              <Typography variant="h6">Available Survey</Typography>
              {openSurvey ? (
                <Button
                  variant="contained"
                  onClick={() => setCurrentSurvey(openSurvey)}
                  sx={{ mt: 2 }}
                >
                  Start Survey: {openSurvey.survey.name}
                </Button>
              ) : (
                <Typography>No surveys currently assigned</Typography>
              )}

              <Typography variant="h6" sx={{ mt: 4 }}>Completed Surveys</Typography>
              <List>
                {completedSurveys.map((survey, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={survey.survey.name}
                      secondary={
                        <Box>
                          {Object.entries(survey.answers).map(([questionId, answer]) => (
                            <Typography key={questionId} variant="body2">
                              {survey.survey.questions.find(q => q.id === parseInt(questionId)).text}:
                              {' '}{answer}
                            </Typography>
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {currentSurvey && (
            <Box>
              <Typography variant="h5">{currentSurvey.survey.name}</Typography>
              {currentSurvey.survey.questions.map((question) => (
                <Box key={question.id} sx={{ mt: 3 }}>
                  <Typography variant="h6">{question.text}</Typography>
                  {question.type === 'rating' ? (
                    <RadioGroup
                      row
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <FormControlLabel
                          key={value}
                          value={value.toString()}
                          control={<Radio />}
                          label={value}
                        />
                      ))}
                    </RadioGroup>
                  ) : (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                    />
                  )}
                </Box>
              ))}
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ mt: 3 }}
                disabled={currentSurvey.survey.questions.some(q => !answers[q.id])}
              >
                Submit Survey
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default UserDashboard;