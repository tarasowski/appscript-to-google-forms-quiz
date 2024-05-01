var folderId = "14iA0meL3by3WZwBelHNfBO0JhN3f2bmK"

function doGet() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('Sheet1');
  var numberRows = sheet.getDataRange().getNumRows();
  var fileName = ss.getName(); 

  // Read the sheet data into arrays.
  var myQuestions = sheet.getRange(2, 1, numberRows - 1, 1).getValues(); 
  var myAnswers = sheet.getRange(2, 2, numberRows - 1, 1).getValues(); 
  var myChoices = sheet.getRange(2, 3, numberRows - 1, 3).getValues(); // Adjusted to read 3 choices

  // Create an array to hold shuffled questions
  var shuffledQuestions = [];

  // Shuffle the choices and associate each with its corresponding index and correct answer.
  for (var i = 0; i < myQuestions.length; i++) {
    var choices = myChoices[i];
    var correctAnswer = myAnswers[i][0];
    
    // Exclude the correct answer from shuffling
    var choicesWithoutCorrectAnswer = choices.filter(choice => choice !== correctAnswer);
    shuffleArray(choicesWithoutCorrectAnswer);

    // Insert the correct answer at a random index
    var correctIndex = Math.floor(Math.random() * 4); // Adjusted to 3 choices
    choicesWithoutCorrectAnswer.splice(correctIndex, 0, correctAnswer);

    // Take only the first three choices
    var shuffledChoices = choicesWithoutCorrectAnswer.slice(0, 4); // Adjusted to take 3 choices

    // Create a shuffled question object
    var shuffledQuestion = {
      question: myQuestions[i][0],
      choices: shuffledChoices
    };
    shuffledQuestions.push(shuffledQuestion);
  }

  // Create the form as a quiz.
  var form = FormApp.create(fileName);
  
  form.setIsQuiz(true);
  form.setRequireLogin(false);

  // Add email question as the first question.
  var emailItem = form.addTextItem();
  emailItem.setTitle("Email")
           .setRequired(true)
           .setValidation(FormApp.createTextValidation()
                                  .requireTextIsEmail()
                                  .build());

  // Write out each multiple-choice question to the form.
  for (var i = 0; i < shuffledQuestions.length; i++) {
    var question = shuffledQuestions[i];
    var addItem = form.addMultipleChoiceItem();
    addItem.setTitle(question.question)
      .setPoints(1)
      .setRequired(true)
      .setChoices(question.choices.map(choice => addItem.createChoice(choice, choice === myAnswers[i][0])));
  }

  // Log the form URL.
  var formUrl = form.getPublishedUrl();
  Logger.log('Quiz created: ' + formUrl);

  // Store question data and form URL for later use.
  PropertiesService.getDocumentProperties().setProperty('formUrl', formUrl);

  // Return an HTML response to the user.
  return HtmlService.createHtmlOutput('Quiz created: ' + formUrl);
}

// Function to shuffle an array.
function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
