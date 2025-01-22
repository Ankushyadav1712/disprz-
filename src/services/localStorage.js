// Initialize default admin if not exists
const initializeAdmin = () => {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (!users.admin) {
    users.admin = {
      id: 'admin',
      password: 'admin123',
      role: 'admin'
    };
    localStorage.setItem('users', JSON.stringify(users));
  }
};

// User related operations
export const addUser = (userId, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[userId]) {
    return false;
  }
  users[userId] = {
    id: userId,
    password,
    role: 'user'
  };
  localStorage.setItem('users', JSON.stringify(users));
  return true;
};

export const removeUser = (userId) => {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (!users[userId] || users[userId].role === 'admin') {
    return false;
  }
  delete users[userId];
  localStorage.setItem('users', JSON.stringify(users));
  return true;
};

export const authenticateUser = (userId, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  return users[userId] && users[userId].password === password ? users[userId] : null;
};

// Survey related operations
export const createSurvey = (survey) => {
  const surveys = JSON.parse(localStorage.getItem('surveys')) || {};
  surveys[survey.id] = survey;
  localStorage.setItem('surveys', JSON.stringify(surveys));
};

export const assignSurvey = (surveyId, userId) => {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  // Check if user already has an open survey
  const hasOpenSurvey = Object.values(assignments).some(
    assignment => assignment.userId === userId && !assignment.completed
  );
  if (hasOpenSurvey) {
    return false;
  }
  assignments[`${surveyId}-${userId}`] = {
    surveyId,
    userId,
    completed: false,
    answers: {}
  };
  localStorage.setItem('assignments', JSON.stringify(assignments));
  return true;
};

export const submitSurvey = (surveyId, userId, answers) => {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  const key = `${surveyId}-${userId}`;
  if (assignments[key]) {
    assignments[key].completed = true;
    assignments[key].answers = answers;
    localStorage.setItem('assignments', JSON.stringify(assignments));
    return true;
  }
  return false;
};

export const getUserSurveys = (userId) => {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  const surveys = JSON.parse(localStorage.getItem('surveys')) || {};
  return Object.values(assignments)
    .filter(assignment => assignment.userId === userId)
    .map(assignment => ({
      ...assignment,
      survey: surveys[assignment.surveyId]
    }));
};

export const getAllSurveys = () => {
  return JSON.parse(localStorage.getItem('surveys')) || {};
};

export const getSurveyResponses = (surveyId) => {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || {};
  return Object.values(assignments)
    .filter(assignment => assignment.surveyId === surveyId && assignment.completed);
};

// Initialize admin on load
initializeAdmin();