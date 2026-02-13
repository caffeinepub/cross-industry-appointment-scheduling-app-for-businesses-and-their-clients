export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('already taken') || message.includes('overlap')) {
      return 'This time slot is already booked. Please choose a different time.';
    }
    
    if (message.includes('outside working hours')) {
      return 'The selected time is outside business hours. Please choose a time during working hours.';
    }
    
    if (message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (message.includes('does not exist')) {
      return 'The requested resource was not found.';
    }
    
    if (message.includes('already exists')) {
      return 'A record with this information already exists.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
