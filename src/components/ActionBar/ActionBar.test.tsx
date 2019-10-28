import React from 'react';
import { mount } from 'enzyme';

import api from '../../utils/api';
import { DetailContext } from '../../pages/Version';

import { ActionBar } from './ActionBar';

const mockPackageMeta = {
  _uplinks: {},
  latest: {
    name: 'verdaccio',
    version: '0.0.0',
    dist: {
      fileCount: 1,
      unpackedSize: 1,
    },
  },
};

const withActionBarComponent = (packageMeta: React.ContextType<typeof DetailContext>['packageMeta']): JSX.Element => (
  <DetailContext.Provider value={{ packageMeta }}>
    <ActionBar />
  </DetailContext.Provider>
);

describe('<ActionBar /> component', () => {
  test('should render the component in default state', () => {
    const wrapper = mount(withActionBarComponent(mockPackageMeta));

    expect(wrapper.html()).toBeNull();
  });

  test('when there is no action bar data', () => {
    const wrapper = mount(withActionBarComponent({ latest: {} } as any));

    expect(wrapper.html()).toBeNull();
  });

  test('when there is no latest property in package meta', () => {
    const wrapper = mount(withActionBarComponent({} as any));

    expect(wrapper.html()).toBeNull();
  });

  test('when there is a button to download a tarball', () => {
    const wrapper = mount(
      withActionBarComponent({
        ...mockPackageMeta,
        latest: {
          ...mockPackageMeta.latest,
          ...{
            dist: {
              fileCount: 1,
              unpackedSize: 1,
              tarball: 'http://localhost:8080/bootstrap/-/bootstrap-4.3.1.tgz',
            },
          },
        },
      })
    );
    expect(wrapper.html()).toMatchSnapshot();

    const button = wrapper.find('button');
    expect(button).toHaveLength(1);

    const spy = jest.spyOn(api, 'request');
    button.simulate('click');
    expect(spy).toHaveBeenCalled();
  });

  test('when there is a button to open an issue', () => {
    const wrapper = mount(
      withActionBarComponent({
        ...mockPackageMeta,
        latest: {
          ...mockPackageMeta.latest,
          ...{
            bugs: {
              url: 'https://verdaccio.tld/bugs',
            },
          },
        },
      })
    );
    expect(wrapper.html()).toMatchSnapshot();

    const button = wrapper.find('button');
    expect(button).toHaveLength(1);
  });
});
