import {
  ThresholdCheck,
  DeadmanCheck,
  CheckType,
  CheckBase,
  RemoteDataState,
} from 'src/types'
import {Action} from 'src/alerting/actions/alertBuilder'
import {
  DEFAULT_CHECK_NAME,
  DEFAULT_CHECK_EVERY,
  DEFAULT_CHECK_OFFSET,
  DEFAULT_DEADMAN_LEVEL,
  DEFAULT_CHECK_REPORT_ZERO,
  DEFAULT_STATUS_MESSAGE,
  DEFAULT_CHECK_TAGS,
} from 'src/alerting/constants'

type FromBase = Required<Pick<CheckBase, 'name' | 'id' | 'status'>>

type FromThreshold = Required<
  Pick<
    ThresholdCheck,
    'thresholds' | 'every' | 'offset' | 'tags' | 'statusMessageTemplate'
  >
>

type FromDeadman = Required<
  Pick<DeadmanCheck, 'timeSince' | 'reportZero' | 'staleTime' | 'level'>
>

export interface AlertBuilderState
  extends FromBase,
    FromThreshold,
    FromDeadman {
  type: CheckType
  checkStatus: RemoteDataState
}

export const initialState = (): AlertBuilderState => ({
  id: null,
  status: 'active',
  type: 'threshold',
  name: DEFAULT_CHECK_NAME,
  every: DEFAULT_CHECK_EVERY,
  offset: DEFAULT_CHECK_OFFSET,
  tags: DEFAULT_CHECK_TAGS,
  statusMessageTemplate: DEFAULT_STATUS_MESSAGE,
  timeSince: '90s',
  reportZero: DEFAULT_CHECK_REPORT_ZERO,
  staleTime: '10m',
  level: DEFAULT_DEADMAN_LEVEL,
  thresholds: [],
  checkStatus: RemoteDataState.NotStarted,
})

export default (
  state: AlertBuilderState = initialState(),
  action: Action
): AlertBuilderState => {
  switch (action.type) {
    case 'RESET_ALERT_BUILDER': {
      return initialState()
    }

    case 'INIT_ALERT_BUILDER': {
      return {
        ...initialState(),
        type: action.payload.type,
        checkStatus: RemoteDataState.Done,
      }
    }

    case 'CONVERT_CHECK_TO_CUSTOM': {
      return {...state, type: 'custom'}
    }

    case 'SET_ALERT_BUILDER_CHECK': {
      const {id, type, name, query} = action.payload.check

      const newState = {
        ...initialState(),
        id,
        type,
        name,
        checkStatus: RemoteDataState.Done,
        query,
      }

      if (action.payload.check.type === 'custom') {
        return newState
      } else if (action.payload.check.type === 'threshold') {
        const {
          thresholds,
          every,
          offset,
          tags,
          statusMessageTemplate,
        } = action.payload.check

        return {
          ...newState,
          thresholds,
          every,
          offset,
          tags,
          statusMessageTemplate,
        }
      } else if (action.payload.check.type === 'deadman') {
        const {
          timeSince,
          staleTime,
          reportZero,
          level,
          every,
          offset,
          tags,
          statusMessageTemplate,
        } = action.payload.check

        return {
          ...newState,
          timeSince,
          staleTime,
          reportZero,
          level,
          every,
          offset,
          tags,
          statusMessageTemplate,
        }
      }
      return
    }

    case 'SET_ALERT_BUILER_CHECK_STATUS': {
      return {...state, checkStatus: action.payload.checkStatus}
    }

    case 'SET_ALERT_BUILDER_EVERY': {
      return {...state, every: action.payload.every}
    }

    case 'SET_ALERT_BUILDER_OFFSET': {
      return {...state, offset: action.payload.offset}
    }

    case 'SET_ALERT_BUILDER_STALETIME': {
      return {...state, staleTime: action.payload.staleTime}
    }

    case 'SET_ALERT_BUILDER_TIMESINCE': {
      return {...state, timeSince: action.payload.timeSince}
    }

    case 'SET_ALERT_BUILDER_LEVEL': {
      return {...state, level: action.payload.level}
    }

    case 'SET_ALERT_BUILDER_MESSAGE_TEMPLATE': {
      return {
        ...state,
        statusMessageTemplate: action.payload.statusMessageTemplate,
      }
    }

    case 'EDIT_ALERT_BUILDER_TAGSET': {
      const newTags = [...state.tags]
      newTags[action.payload.index] = action.payload.tagSet
      return {
        ...state,
        tags: newTags,
      }
    }

    case 'REMOVE_ALERT_BUILDER_TAGSET': {
      return {
        ...state,
        tags: state.tags.filter((_, i) => i !== action.payload.index),
      }
    }

    case 'UPDATE_ALERT_BUILDER_THRESHOLD': {
      const thresholds = state.thresholds
      const filteredThresholds = thresholds.filter(
        t => t.level !== action.payload.threshold.level
      )
      return {
        ...state,
        thresholds: [...filteredThresholds, action.payload.threshold],
      }
    }

    case 'UPDATE_ALERT_BUILDER_THRESHOLDS': {
      return {
        ...state,
        thresholds: action.payload.thresholds,
      }
    }

    case 'REMOVE_ALERT_BUILDER_THRESHOLD': {
      const thresholds = state.thresholds
      return {
        ...state,
        thresholds: thresholds.filter(t => t.level !== action.payload.level),
      }
    }

    case 'UPDATE_ALERT_BUILDER_NAME': {
      return {
        ...state,
        name: action.payload.name,
      }
    }

    default:
      return state
  }
}