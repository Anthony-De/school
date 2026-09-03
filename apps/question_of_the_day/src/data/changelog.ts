export type ChangelogRelease = {
  version: string;
  changes: string[];
};

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0.1',
    changes: [
      'Classroom view: The question, options, and student groups now use more of the screen on desktop and iPad, with an even larger Present mode.',
      'Toolbar: Related tools are grouped, Present is easier to find, Clear looks like a caution action, and setup tools stay out of the way while presenting.',
      'Undo and Redo: The icons are clearer, both tools remain available in Present mode, and clearing all responses can now be undone.',
      'Question tabs: The selected tab is connected to the page with color, close buttons stay on the right, and other close buttons appear only on hover.',
      'Question progress: Tabs show when a question is partly answered or complete, and the tab row scrolls when many questions are open.',
      'Options: Cards resize to fit the number of answers, use more available width, and scroll only when a question has many options.',
      'Dragging students: The whole option card and both student groups are drop areas, with a visible name card and gender-colored feedback while dragging.',
      'Student cards: Names use one clean, solid gender-colored border after they are placed, without doubled borders or mismatched drag colors.',
      'Click to move: Selected names use the same gender color as dragging, stay aligned, and are unselected when you click somewhere else.',
      'Answer order: Names stay in the order they were added to each option, and every newly added name goes to the end.',
      'Response counts: Each option now clearly says how many students selected it.',
      'Attendance: The toolbar shows the number absent, the question shows an absence reminder, and Attendance is clearly disabled when no question is open.',
      'Question Library: Saved Work appears first and looks different from library questions, with separate category filters and collapsible sections that expand into the available height.',
      'Finding questions: Search and Random remain easy to reach, answer choices are previewed, and New question sits beside the Questions heading.',
      'Using questions: Choosing a library question opens it in a new tab and confirms that it was added.',
      'Used questions: Questions can be marked used or unused, and Clear All Used shows a count and asks for confirmation before clearing every marker.',
      'Hidden questions: Built-in questions use Hide instead of Delete, teacher-created questions can still be deleted, and Restore Hidden shows a count with two confirmations.',
      'Question Settings: Option rows are more compact, no longer scroll sideways, support thumbnails and picture replacement, and allow any practical number of options.',
      'New questions: New questions begin with blank options instead of copying the current question.',
      'Long forms: Modal titles and action buttons stay visible while only the form contents scroll.',
      'Class Settings: The shared roster, editable group names and colors, Add Student, and Sort A–Z are kept together, while Data & Backup is collapsible.',
      'Backups: Import clearly warns before replacing classroom data, and exported backups continue to include the classroom and pictures.'
    ]
  }
];

export const CURRENT_RELEASE = CHANGELOG[0];
