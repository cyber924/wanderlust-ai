import test from 'node:test';
import assert from 'node:assert/strict';
import { writeBatch, doc, Timestamp } from 'firebase/firestore';
import { mapDocToBlogPost, db } from '../src/lib/firebase.ts';
import { toFirestoreData } from '../src/utils/firestoreData.ts';

test('archive posts with absent optional fields pass real Firestore batch validation', () => {
  const post = mapDocToBlogPost('publish-validation-only', {
    title: '새 발행글', status: 'draft', isPublic: false,
    itinerary: [{day: 1, title: '코스', activities: [{spot: '서울', description: '소개', imageUrl: undefined}]}],
  });
  const raw = {...post, status: 'published', isPublic: true, updatedAtServer: Timestamp.now()};
  assert.throws(() => writeBatch(db).set(doc(db, 'blogs', post.id), raw), /undefined/);
  const data = toFirestoreData(raw);
  const batch = writeBatch(db);
  // Validate both writes locally. Deliberately never commit a test document.
  assert.doesNotThrow(() => {
    batch.set(doc(db, 'blogs', post.id), data, {merge: true});
    batch.set(doc(db, 'travel_blog_posts', post.id), data, {merge: true});
  });
  assert.equal(data.status, 'published');
  assert.equal(data.isPublic, true);
  assert.equal(data.updatedAtServer, raw.updatedAtServer);
  assert.equal(data.title, post.title);
  assert.equal('imageUrl' in data.itinerary[0].activities[0], false);
  assert.equal('recurrence' in data, false);
  assert.equal('recurrence' in raw, true); // Source remains unchanged.
});

test('explicit nulls, dates, false and zero survive data preparation', () => {
  const when = new Date('2026-10-15');
  const data = toFirestoreData({when, removed: undefined, empty: null, isPublic: false, views: 0, list: [undefined, 0]});
  assert.equal(data.when, when);
  assert.equal(data.empty, null);
  assert.equal(data.isPublic, false);
  assert.equal(data.views, 0);
  assert.deepEqual(data.list, [null, 0]);
  assert.equal('removed' in data, false);
});
