/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React, { useEffect, useState, useRef } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';

import Icon from '../resources/timer.svg';

/**
 * An example client extension plugin to enable auto saving functionality
 * in the Camunda Modeler
 */
export default function AutoSavePlugin(props) {

  /**
    * The component props include APIs the Application offers plugins:
    *
    * - config: save and retrieve information to the local configuration
    * - displayNotification: show notifications inside the application
    * - log: log information into the Log panel
    * - settings: register and retrieve the application settings
    * - subscribe: hook into application events, like <tab.saved>, <app.activeTabChanged> etc.
    * - triggerAction: execute editor actions, like <save>, <open-diagram> etc.
    */
  const {
    displayNotification,
    subscribe,
    settings,
    triggerAction
  } = props;

  const [ enabled, setEnabled ] = useState(false);
  const [ interval, setInterval ] = useState(5);

  const [ activeTab, setActiveTab ] = useState({});

  const timer = useRef(null);

  /**
    * Register the plugin settings to enable the user to configure
    * the auto-save feature in the Modeler settings window.
    *
    * Learn more:
    * - Settings in Camunda Modeler: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/settings/
    * - Settings API: https://github.com/camunda/camunda-modeler/blob/main/client/src/app/Settings.js
  */
  useEffect(() => {
    const values = settings.register(pluginSettings);

    setEnabled(values['autoSavePlugin.enabled']);
    setValidInterval(values['autoSavePlugin.interval']);

    settings.subscribe('autoSavePlugin.enabled', ({ value }) => {
      setEnabled(value);
    });

    settings.subscribe('autoSavePlugin.interval', ({ value }) => {
      setValidInterval(value);
    });

  }, [ settings ]);

  /**
   * Use the `subscribe` API to hook into application events.
   */
  useEffect(() => {

    subscribe('app.activeTabChanged', ({ activeTab }) => {
      setActiveTab(activeTab);
    });

    subscribe('tab.saved', () => {
      if (enabled && !timer.current) {
        startTimer();
      }
    });

  }, [ subscribe ]);

  useEffect(() => {
    if (enabled && activeTab?.file?.path) {
      startTimer();
    }

    return () => clearTimer();
  }, [ activeTab, interval ]);


  const startTimer = () => {
    timer.current = setTimeout(() => {
      save();
      startTimer(); // Restart the timer after saving
    }, interval * 1000);
  };

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const save = () => {
    triggerAction('save')
      .then(tab => {
        if (!tab) {
          return displayNotification({ title: 'Failed to save' });
        }
      });
  };

  const setValidInterval = (value) => {
    const num = parseInt(value, 10);

    if (isNaN(num) || num <= 0) {
      displayNotification({
        title: 'AutoSave Plugin: Invalid interval',
        type: 'error',
        content: 'Please enter a valid number greater than 0.'
      });

      return;
    }

    setInterval(num);
  };


  if (!enabled) {
    return null;
  }

  // We can a <Fill> component to render into a specific slot in the Modeler UI
  // Here we render an icon indicating the auto-save is active
  return (
    <Fill slot="status-bar__app" group="1_autosave">
      <button className="btn" title="AutoSave enabled"><Icon /></button>
    </Fill>
  );
}

const pluginSettings = {
  id: 'autoSavePlugin',
  title: 'Auto-Save Plugin',
  properties: {
    'autoSavePlugin.enabled': {
      type: 'boolean',
      default: false,
      label: 'Enabled'
    },
    'autoSavePlugin.interval': {
      type: 'text',
      default: '5',
      label: 'Interval (seconds)',
    },
  }
};
