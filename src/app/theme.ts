import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';
import type { Preset } from '@primeuix/themes/types';

const personnalisation = {
  primitive: {
    bordeaux: {
      50: '#fdf2f4',
      100: '#fbe5e8',
      200: '#f5c2ca',
      300: '#ec95a2',
      400: '#d9546a',
      500: '#b01a30',
      600: '#961628',
      700: '#7b1221',
      800: '#620e1a',
      900: '#4d0b15',
      950: '#2c060c',
    },
    cave: {
      0: '#ffffff',
      50: '#f5f5f5',
      100: '#eaeaea',
      200: '#e1e1e1',
      300: '#c4c4c4',
      400: '#9e9e9e',
      500: '#737373',
      600: '#525252',
      700: '#3a3a3a',
      800: '#303030',
      900: '#262626',
      950: '#1a1a1a',
    },
  },

  semantic: {
    primary: {
      50: '{bordeaux.50}',
      100: '{bordeaux.100}',
      200: '{bordeaux.200}',
      300: '{bordeaux.300}',
      400: '{bordeaux.400}',
      500: '{bordeaux.500}',
      600: '{bordeaux.600}',
      700: '{bordeaux.700}',
      800: '{bordeaux.800}',
      900: '{bordeaux.900}',
      950: '{bordeaux.950}',
      color: '{bordeaux.500}',
      contrastColor: '{cave.0}',
      hoverColor: '{bordeaux.600}',
      activeColor: '{bordeaux.700}',
    },
    highlight: {
      background: '{bordeaux.500}',
      focusBackground: '{bordeaux.600}',
      color: '{cave.0}',
      focusColor: '{cave.0}',
    },
    surface: {
      0: '{cave.0}',
      50: '{cave.50}',
      100: '{cave.100}',
      200: '{cave.200}',
      300: '{cave.300}',
      400: '{cave.400}',
      500: '{cave.500}',
      600: '{cave.600}',
      700: '{cave.700}',
      800: '{cave.800}',
      900: '{cave.900}',
      950: '{cave.950}',
    },
    text: {
      color: 'light-dark({cave.950}, {cave.0})',
      hoverColor: 'light-dark({cave.950}, {cave.0})',
      mutedColor: 'light-dark({cave.600}, {cave.100})',
      hoverMutedColor: 'light-dark({cave.800}, {cave.0})',
    },
    content: {
      background: 'light-dark({cave.0}, {cave.900})',
      hoverBackground: 'light-dark({cave.100}, {cave.800})',
      borderColor: '{cave.200}',
    },
  },
};

export const AmisDuBonBourgognePreset = definePreset(Nora, personnalisation as Preset);
