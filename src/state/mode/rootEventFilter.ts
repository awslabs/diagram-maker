import { NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';
import { EditorMode, EditorModeType } from 'diagramMaker/state/types';

import readOnlyEventFilter from './readOnly/readOnlyEventFilter';

const { READ_ONLY } = EditorMode;

export default function rootEventFilter(e: NormalizedEvent, editorMode: EditorModeType): boolean {
  switch (editorMode) {
    case READ_ONLY:
      return readOnlyEventFilter(e);
    default:
      return true;
  }
}
