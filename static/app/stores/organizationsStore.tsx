import OrganizationsActions from 'cliff/actions/organizationsActions';
import {Organization} from 'cliff/types';
import {makeSafeRefluxStore} from 'cliff/utils/makeSafeRefluxStore';
import {createStore, StoreDefinition} from 'reflux';

interface OrganizationsStoreDefinition extends StoreDefinition {
  add(item: Organization): void;
  get(slug: string): Organization | undefined;

  getAll(): Organization[];
  load(items: Organization[]): void;
  loaded: boolean;
  onChangeSlug(prev: Organization, next: Organization): void;
  onRemoveSuccess(slug: string): void;
  onUpdate(org: Organization): void;
  remove(slug: string): void;
  state: Organization[];
}

const storeConfig: OrganizationsStoreDefinition = {
  listenables: [OrganizationsActions],

  state: [],
  loaded: false,

  // So we can use Reflux.connect in a component mixin
  getInitialState() {
    return this.state;
  },

  init() {
    this.state = [];
    this.loaded = false;
  },

  onUpdate(org: Organization) {
    this.add(org);
  },

  onChangeSlug(prev: Organization, next: Organization) {
    if (prev.slug === next.slug) {
      return;
    }

    this.remove(prev.slug);
    this.add(next);
  },

  onRemoveSuccess(slug: string) {
    this.remove(slug);
  },

  get(slug: Organization['slug']) {
    return this.state.find((item: Organization) => item.slug === slug);
  },

  getAll() {
    return this.state;
  },

  remove(slug: Organization['slug']) {
    this.state = this.state.filter(item => slug !== item.slug);
    this.trigger(this.state);
  },

  add(item: Organization) {
    let match = false;
    this.state.forEach((existing, idx) => {
      if (existing.id === item.id) {
        item = {...existing, ...item};
        this.state[idx] = item;
        match = true;
      }
    });
    if (!match) {
      this.state = [...this.state, item];
    }
    this.trigger(this.state);
  },

  load(items: Organization[]) {
    this.state = items;
    this.loaded = true;
    this.trigger(items);
  },
};

const OrganizationsStore = createStore(makeSafeRefluxStore(storeConfig));

export default OrganizationsStore;
