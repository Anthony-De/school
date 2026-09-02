export type ChangelogRelease = {
  version: string;
  changes: string[];
};

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0.1',
    changes: [
      'Improved the Question Library with saved work, separate category filters, and a larger scrolling area.',
      'Added used-question markers, a used count, Clear All Used, and Restore Hidden confirmations.',
      'Improved tabs so the selected question is clearer and close buttons stay aligned.',
      'Improved dragging and click-to-move with gender colors, cleaner borders, and names kept in the order they were added.',
      'Added per-question attendance and clearer disabled controls when no question is open.',
      'Improved Undo, Redo, presentation mode, response counts, backups, and the classroom layout.'
    ]
  }
];

export const CURRENT_RELEASE = CHANGELOG[0];
