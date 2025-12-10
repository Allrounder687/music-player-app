/**
 * Command pattern implementation for undoable actions
 */
export class Command {
  execute() {
    throw new Error('Execute method must be implemented');
  }

  undo() {
    throw new Error('Undo method must be implemented');
  }
}

export class DeleteTrackCommand extends Command {
  constructor(trackId, deleteTrackFn, restoreTrackFn, trackData) {
    super();
    this.trackId = trackId;
    this.deleteTrackFn = deleteTrackFn;
    this.restoreTrackFn = restoreTrackFn;
    this.trackData = trackData;
  }

  execute() {
    return this.deleteTrackFn(this.trackId);
  }

  undo() {
    return this.restoreTrackFn(this.trackData);
  }
}

export class CommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  execute(command) {
    // Remove any commands after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Execute command
    const result = command.execute();
    
    // Add to history
    this.history.push(command);
    this.currentIndex++;
    
    return result;
  }

  undo() {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      const result = command.undo();
      this.currentIndex--;
      return result;
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      return command.execute();
    }
    return null;
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}