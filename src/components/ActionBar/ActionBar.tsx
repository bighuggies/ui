import React, { useContext } from 'react';
import BugReportIcon from '@material-ui/icons/BugReport';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import HomeIcon from '@material-ui/icons/Home';

import { DetailContext } from '../../pages/Version';
import { isURL, extractFileName, downloadFile } from '../../utils/url';
import api from '../../utils/api';
import Tooltip from '../../muiComponents/Tooltip';
import List from '../../muiComponents/List';

import { Fab, ActionListItem } from './styles';

export interface Action {
  icon: string;
  title: string;
  handler?: Function;
}

export async function downloadHandler(link: string): Promise<void> {
  const fileStream: Blob = await api.request(link, 'GET', {
    headers: {
      ['accept']:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    },
    credentials: 'include',
  });
  const fileName = extractFileName(link);
  downloadFile(fileStream, fileName);
}

const ACTIONS = {
  homepage: {
    icon: <HomeIcon />,
    title: 'Visit homepage',
  },
  issue: {
    icon: <BugReportIcon />,
    title: 'Open an issue',
  },
  tarball: {
    icon: <DownloadIcon />,
    title: 'Download tarball',
    handler: downloadHandler,
  },
};

const ActionBar: React.FC = () => {
  const { packageMeta } = useContext(DetailContext);

  if (!packageMeta || !packageMeta.latest) {
    return null;
  }

  const { latest } = packageMeta;
  const { homepage, bugs, dist } = latest;

  const actionsMap = {
    homepage,
    issue: bugs ? bugs.url : null,
    tarball: dist ? dist.tarball : null,
  };

  const renderList = Object.keys(actionsMap).reduce((component: React.ReactElement[], value, key) => {
    const link = actionsMap[value];
    if (link && isURL(link)) {
      const actionItem: Action = ACTIONS[value];
      if (actionItem.handler) {
        const fab = (
          <Tooltip key={key} title={actionItem['title']}>
            <Fab
              /* eslint-disable react/jsx-no-bind */
              onClick={() => {
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                actionItem.handler!(link);
              }}
              size={'small'}>
              {actionItem['icon']}
            </Fab>
          </Tooltip>
        );
        component.push(fab);
      } else {
        const fab = <Fab size={'small'}>{actionItem['icon']}</Fab>;
        component.push(
          <Tooltip key={key} title={actionItem['title']}>
            <>
              {/* the parent fragment prevents the tooltip title from being forwarded to the <a> tag */}
              <a href={link} target={'_blank'}>
                {fab}
              </a>
            </>
          </Tooltip>
        );
      }
    }
    return component;
  }, []);

  if (renderList.length > 0) {
    return (
      <List>
        <ActionListItem alignItems={'flex-start'} button={true}>
          {renderList}
        </ActionListItem>
      </List>
    );
  }

  return null;
};

export { ActionBar };
