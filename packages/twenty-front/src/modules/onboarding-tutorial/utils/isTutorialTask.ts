import { UserTutorialExplanation, UserTutorialTask } from 'twenty-shared';

export const isTutorialTask = (
  step: UserTutorialTask | UserTutorialExplanation,
): step is UserTutorialTask => {
  return Object.values(UserTutorialTask).includes(step as UserTutorialTask);
};
