import { db, auth } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, documentId, query, where, orderBy, limit, addDoc, serverTimestamp, updateDoc, deleteDoc, setDoc, QueryConstraint, startAfter, runTransaction, increment } from 'firebase/firestore';
import type { FirestoreCursor, Job, Category, User, WorkType, Testimonial, Competition, Organizer, Article, Report, ContactMessage, ImmigrationPost, PaginatedResponse } from './types';
import { unstable_cache } from 'next/cache';
import Fuse from 'fuse.js';
import { getProgramTypeDetails } from './utils';
import { updateProfile } from 'firebase/auth';

const categories: Category[] = [
  { id: 'it', name: 'تكنولوجيا المعلومات', iconName: 'Code', color: '#1E88E5' },
  { id: 'engineering', name: 'الهندسة', iconName: 'CircuitBoard', color: '#FB8C00' },
  { id: 'construction', name: 'البناء والأشغال العامة', iconName: 'HardHat', color: '#78909C' },
  { id: 'healthcare', name: 'الصحة والتمريض', iconName: 'Stethoscope', color: '#43A047' },
  { id: 'education', name: 'التعليم والتدريب', iconName: 'BookOpen', color: '#8E24AA' },
  { id: 'finance', name: 'المالية والمحاسبة', iconName: 'Calculator', color: '#00ACC1' },
  { id: 'admin', name: 'الإدارة والسكرتارية', iconName: 'KanbanSquare', color: '#5E35B1' },
  { id: 'marketing', name: 'التسويق والمبيعات', iconName: 'Megaphone', color: '#E53935' },
  { id: 'hr', name: 'الموارد البشرية', iconName: 'Users', color: '#3949AB' },
  { id: 'hospitality', name: 'الفندقة والسياحة', iconName: 'ConciergeBell', color: '#D81B60' },
  { id: 'logistics', name: 'النقل واللوجستيك', iconName: 'Truck', color: '#F4511E' },
  { id: 'security', name: 'الخدمات الأمنية', iconName: 'Shield', color: '#546E7A' },
  { id: 'crafts', name: 'الحرف والصناعات التقليدية', iconName: 'PenTool', color: '#A1887F' },
  { id: 'manufacturing', name: 'الصناعة والإنتاج', iconName: 'Factory', color: '#455A64' },
  { id: 'law', name: 'القانون والشؤون القانونية', iconName: 'Gavel', color: '#6D4C41' },
  { id: 'gov', name: 'وظائف حكومية', iconName: 'Landmark', color: '#0277BD' },
  { id: 'media', name: 'الإعلام والاتصال', iconName: 'Newspaper', color: '#00897B' },
  { id: 'retail', name: 'التجارة والتوزيع', iconName: 'ShoppingCart', color: '#37474F' },
  { id: 'agriculture', name: 'الفلاحة والزراعة', iconName: 'Sprout', color: '#388E3C' },
];

const organizers: Organizer[] = [
  { name: "الوزارات والجماعات الترابية", icon: "Landmark", color: "#37474F" },
  { name: "وزارة التربية الوطنية", icon: "BookOpen", color: "#8E24AA" },
  { name: "الأمن والقوات المسلحة", icon: "ShieldCheck", color: "#1E88E5" },
  { name: "وزارة الصحة والحماية الاجتماعية", icon: "Stethoscope", color: "#43A047" },
  { name: "المؤسسات والهيئات العمومية", icon: "FileText", color: '#00897B' },
  { name: "الجامعات والمعاهد العليا", icon: "School", color: '#424242' }
];

// Retries a Firestore read a couple of times before giving up.
// IMPORTANT: this must throw (not swallow to null) on final failure so that
// unstable_cache() never caches a transient network/Firestore error as a
// permanent "not found" result for an hour (which was causing random ads to
// intermittently 404).
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

function formatTimeAgo(timestamp: any) {
  if (!timestamp || !timestamp.toDate) {
    return 'غير معروف';
  }
  const date = timestamp.toDate();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return years === 1 ? `قبل سنة` : `قبل ${years} سنوات`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return months === 1 ? `قبل شهر` : `قبل ${months} أشهر`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return days === 1 ? `قبل يوم` : `قبل ${days} أيام`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return hours === 1 ? `قبل ساعة` : `قبل ${hours} ساعات`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return minutes === 1 ? `قبل دقيقة` : `قبل ${minutes} دقائق`;
  }
  return 'الآن';
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

function mapSnapshotToJobs(snapshot: any): Job[] {
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

    return {
      id: doc.id,
      ...data,
      postedAt: formatTimeAgo(data.createdAt),
      createdAtISO: createdAtDate.toISOString(),
      isNew: (new Date().getTime() - createdAtDate.getTime()) < 24 * 60 * 60 * 1000,
    } as Job;
  });
}

function mapSnapshotToCompetitions(snapshot: any): Competition[] {
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

    return {
      id: doc.id,
      ...data,
      postedAt: formatTimeAgo(data.createdAt),
      createdAtISO: createdAtDate.toISOString(),
      isNew: (new Date().getTime() - createdAtDate.getTime()) < 24 * 60 * 60 * 1000,
    } as Competition;
  });
}

function mapSnapshotToImmigrationPosts(snapshot: any): ImmigrationPost[] {
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
    const programDetails = getProgramTypeDetails(data.programType);
    
    return {
      id: doc.id,
      ...data,
      iconName: programDetails.icon,
      postedAt: formatTimeAgo(data.createdAt),
      createdAtISO: createdAtDate.toISOString(),
      isNew: (new Date().getTime() - createdAtDate.getTime()) < 24 * 60 * 60 * 1000,
    } as ImmigrationPost;
  });
}

async function getJobOffers(
  options: {
    count?: number;
    searchQuery?: string;
    country?: string;
    city?: string;
    categoryId?: string;
    workType?: WorkType;
    excludeId?: string;
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<Job>> {
  try {
    const { count, searchQuery, country, city, categoryId, workType, excludeId, lastDoc, limit: pageLimit = 16  } = options;
    const adsRef = collection(db, 'ads');

    if (searchQuery) {
      const constraints: QueryConstraint[] = [
        where('postType', '==', 'seeking_worker'), 
        orderBy('createdAt', 'desc')
      ];
      const q = query(adsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let allJobs = mapSnapshotToJobs(querySnapshot);

      const fuse = new Fuse(allJobs, {
        keys: ['title', 'description', 'categoryName', 'country', 'city', 'companyName'],
        includeScore: true,
        threshold: 0.4,
      });
      allJobs = fuse.search(searchQuery).map(result => result.item);

      if (country) allJobs = allJobs.filter(j => j.country === country);
      if (city) allJobs = allJobs.filter(j => j.city === city);
      if (categoryId) allJobs = allJobs.filter(j => j.categoryId === categoryId);
      if (workType) allJobs = allJobs.filter(j => j.workType === workType);
      if (excludeId) allJobs = allJobs.filter(j => j.id !== excludeId);

      const data = count ? allJobs.slice(0, count) : allJobs.slice(0, pageLimit);
      
      return { 
        data, 
        totalCount: allJobs.length, 
        lastDoc: null
      };
    }

    let constraints: QueryConstraint[] = [
      where('postType', '==', 'seeking_worker'),
      orderBy('createdAt', 'desc')
    ];

    if (country) constraints.push(where('country', '==', country));
    if (city) constraints.push(where('city', '==', city));
    if (categoryId) constraints.push(where('categoryId', '==', categoryId));
    if (workType) constraints.push(where('workType', '==', workType));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const fetchLimit = count || pageLimit;
    constraints.push(limit(fetchLimit));

    const q = query(adsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    let jobs = mapSnapshotToJobs(querySnapshot);

    if (excludeId) {
      jobs = jobs.filter(j => j.id !== excludeId);
    }

    return { 
      data: jobs, 
      totalCount: undefined,
      lastDoc: lastVisible 
    };
  } catch (error) {
    console.error("Error fetching job offers: ", error);
    return { data: [], totalCount: 0, lastDoc: null };
  }
}

async function getJobSeekers(
  options: {
    count?: number;
    searchQuery?: string;
    country?: string;
    city?: string;
    categoryId?: string;
    workType?: WorkType;
    excludeId?: string;
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<Job>> {
  try {
    const { 
      count, 
      searchQuery, 
      country, 
      city, 
      categoryId, 
      workType, 
      excludeId, 
      lastDoc,
      limit: pageLimit = 16 
    } = options;

    const adsRef = collection(db, 'ads');

    if (searchQuery) {
      const constraints: QueryConstraint[] = [
        where('postType', '==', 'seeking_job'), 
        orderBy('createdAt', 'desc')
      ];
      const q = query(adsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let allJobs = mapSnapshotToJobs(querySnapshot);

      const fuse = new Fuse(allJobs, {
        keys: ['title', 'description', 'categoryName', 'country', 'city'],
        includeScore: true,
        threshold: 0.4,
      });
      allJobs = fuse.search(searchQuery).map(result => result.item);

      if (country) allJobs = allJobs.filter(j => j.country === country);
      if (city) allJobs = allJobs.filter(j => j.city === city);
      if (categoryId) allJobs = allJobs.filter(j => j.categoryId === categoryId);
      if (workType) allJobs = allJobs.filter(j => j.workType === workType);
      if (excludeId) allJobs = allJobs.filter(j => j.id !== excludeId);

      const data = count ? allJobs.slice(0, count) : allJobs.slice(0, pageLimit);
      
      return { 
        data, 
        totalCount: allJobs.length, 
        lastDoc: null 
      };
    }
    
    let constraints: QueryConstraint[] = [
      where('postType', '==', 'seeking_job'),
      orderBy('createdAt', 'desc')
    ];

    if (country) constraints.push(where('country', '==', country));
    if (city) constraints.push(where('city', '==', city));
    if (categoryId) constraints.push(where('categoryId', '==', categoryId));
    if (workType) constraints.push(where('workType', '==', workType));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const fetchLimit = count || pageLimit;
    constraints.push(limit(fetchLimit));

    const q = query(adsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    let jobs = mapSnapshotToJobs(querySnapshot);

    if (excludeId) {
      jobs = jobs.filter(j => j.id !== excludeId);
    }

    return { 
      data: jobs, 
      totalCount: undefined, 
      lastDoc: lastVisible 
    };

  } catch (error) {
    console.error("Error fetching job seekers: ", error);
    return { data: [], totalCount: 0, lastDoc: null };
  }
}

export async function getJobsByUserId(userId: string): Promise<Job[]> {
  try {
    const adsRef = collection(db, 'ads');
    const q = query(
      adsRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      postedAt: formatTimeAgo(doc.data().createdAt),
    } as Job));
    
  } catch (error) {
    console.error("Error fetching jobs by user ID: ", error);
    return [];
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  return withRetry(async () => {
    const docRef = doc(db, 'ads', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      return {
        id: docSnap.id,
        ...data,
        postedAt: formatTimeAgo(data.createdAt),
        createdAtISO: createdAtDate.toISOString(),
      } as Job;
    } else {
      console.log("No such document!");
      return null;
    }
  });
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    return null;
  }
}

export async function postJob(jobData: Omit<Job, 'id' | 'createdAt' | 'likes' | 'rating' | 'postedAt' | 'isNew'>): Promise<{ id: string }> {
  try {
    if (jobData.postType === 'seeking_job' && jobData.userId) {
      const existingSeekerAdsQuery = query(
        collection(db, 'ads'),
        where('userId', '==', jobData.userId),
        where('postType', '==', 'seeking_job')
      );
      const existingSeekerAdsSnapshot = await getDocs(existingSeekerAdsQuery);
      if (!existingSeekerAdsSnapshot.empty) {
        throw new Error('DUPLICATE_SEEKER_AD');
      }
    }

    const newJob: { [key: string]: any } = {
      ...jobData,
      createdAt: serverTimestamp(),
      likes: 0,
    };
      
    Object.keys(newJob).forEach(key => (newJob[key] === undefined || newJob[key] === '') && delete newJob[key]);
    if (newJob.ownerPhotoURL === undefined) newJob.ownerPhotoURL = null;

    const newDocRef = doc(collection(db, 'ads'));
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      transaction.set(newDocRef, newJob);
      const counterField = jobData.postType === 'seeking_worker' ? 'jobs' : 'seekers';
      transaction.update(statsRef, { [counterField]: increment(1) });
    });

    if (auth.currentUser && newJob.ownerPhotoURL && !newJob.ownerPhotoURL.startsWith('data:image')) {
      try {
        if (auth.currentUser.photoURL !== newJob.ownerPhotoURL || (jobData.ownerName && auth.currentUser.displayName !== jobData.ownerName)) {
          await updateProfile(auth.currentUser, {
            photoURL: newJob.ownerPhotoURL,
            displayName: jobData.ownerName || auth.currentUser.displayName
          });
        }
      } catch (e) {
        console.error("Failed to sync user profile photo", e);
      }
    }
    return { id: newDocRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    if (e instanceof Error && e.message === 'DUPLICATE_SEEKER_AD') {
      throw e;
    }
    throw new Error("Failed to post job");
  }
}

export async function updateAd(adId: string, adData: Partial<Job>): Promise<void> {
    try {
        const adRef = doc(db, 'ads', adId);
        
        const dataToUpdate: { [key: string]: any } = {
            ...adData,
            updatedAt: serverTimestamp()
        };
        
        Object.keys(dataToUpdate).forEach(key => {
            if (dataToUpdate[key] === undefined) {
                 delete dataToUpdate[key];
            }
        });
        
        if (dataToUpdate.ownerPhotoURL === '') {
            dataToUpdate.ownerPhotoURL = null;
        }

        await updateDoc(adRef, dataToUpdate);
    } catch (e) {
        console.error("Error updating ad: ", e);
        throw new Error("Failed to update ad");
    }
}

export async function deleteAd(adId: string): Promise<void> {
  try {
    const adRef = doc(db, 'ads', adId);
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      const adSnap = await transaction.get(adRef);
      if (!adSnap.exists()) throw "Document does not exist!";
      
      const type = adSnap.data().postType;
      const counterField = type === 'seeking_worker' ? 'jobs' : 'seekers';

      transaction.delete(adRef);
      transaction.update(statsRef, { [counterField]: increment(-1) });
    });
  } catch (e) {
    console.error("Error deleting ad: ", e);
    throw new Error("Failed to delete ad");
  }
}

export async function updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
        const userRef = doc(db, 'users', uid);
        const dataToUpdate: { [key: string]: any } = { ...profileData };

        if (dataToUpdate.photoURL === '' || dataToUpdate.photoURL === undefined) {
            dataToUpdate.photoURL = null;
        }

        await updateDoc(userRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp()
        });

        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
            const updateData: { displayName?: string; photoURL?: string | null } = {};
            
            if (dataToUpdate.name !== undefined) {
                updateData.displayName = dataToUpdate.name;
            }
            
            if (dataToUpdate.photoURL !== undefined) {
                updateData.photoURL = dataToUpdate.photoURL;
            }

            if (Object.keys(updateData).length > 0) {
                 try {
                    await updateProfile(currentUser, updateData);
                } catch (e: any) {
                    if (e.code !== 'auth/invalid-profile-attribute') {
                        throw e;
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error updating user profile: ", e);
        throw new Error("فشل في تحديث الملف الشخصي: " + (e as Error).message);
    }
}

export async function addTestimonial(testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'postedAt'>): Promise<{ id: string }> {
    try {
        const reviewsCollection = collection(db, 'reviews');
        const dataToSave = {
            ...testimonialData,
            createdAt: serverTimestamp(),
        };
        const newDocRef = await addDoc(reviewsCollection, dataToSave);
        return { id: newDocRef.id };
    } catch (e) {
        console.error("Error adding testimonial: ", e);
        throw new Error("Failed to add testimonial");
    }
}

export async function getTestimonials(
  options: { 
    limit?: number; 
    lastDoc?: FirestoreCursor; 
  } = {}
): Promise<PaginatedResponse<Testimonial>> {
  try {
    const { limit: pageLimit = 8, lastDoc } = options;
    const reviewsRef = collection(db, 'reviews');
    
    let constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageLimit));

    const q = query(reviewsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      
      return {
        id: doc.id,
        ...data,
        postedAt: formatTimeAgo(data.createdAt),
        createdAtISO: createdAtDate.toISOString(),
      } as Testimonial;
    });

    return { data, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error fetching testimonials: ", error);
    return { data: [], lastDoc: null };
  }
}

export async function deleteTestimonial(testimonialId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'reviews', testimonialId));
    } catch (e) {
        console.error("Error deleting testimonial: ", e);
        throw new Error("Failed to delete testimonial");
    }
}

export async function postCompetition(competitionData: Omit<Competition, 'id' | 'createdAt' | 'postedAt'>): Promise<{ id: string }> {
  try {
    const newDocRef = doc(collection(db, 'competitions'));
    const statsRef = doc(db, 'stats', 'general');
    
    const newCompetition: any = { ...competitionData, createdAt: serverTimestamp(), positionsAvailable: competitionData.positionsAvailable ?? null };
    Object.keys(newCompetition).forEach(key => (newCompetition[key] === undefined || newCompetition[key] === '') && delete newCompetition[key]);

    await runTransaction(db, async (transaction) => {
      transaction.set(newDocRef, newCompetition);
      transaction.update(statsRef, { competitions: increment(1) });
    });

    return { id: newDocRef.id };
  } catch (e) {
    console.error("Error adding competition: ", e);
    throw new Error("Failed to post competition");
  }
}

export async function getCompetitions(
  options: {
    count?: number;
    searchQuery?: string;
    location?: string;
    excludeId?: string;
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<Competition>> {
  try {
    const { 
      count, 
      searchQuery, 
      location, 
      excludeId, 
      lastDoc, 
      limit: pageLimit = 16 
    } = options;
    
    const competitionsRef = collection(db, 'competitions');

    if (searchQuery || location) {
      const q = query(competitionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      let competitions = mapSnapshotToCompetitions(querySnapshot);

      if (excludeId) {
        competitions = competitions.filter(comp => comp.id !== excludeId);
      }

      if (searchQuery) {
        const fuse = new Fuse(competitions, {
            keys: ['title', 'organizer', 'description', 'location', 'competitionType'],
            includeScore: true,
            threshold: 0.4,
        });
        competitions = fuse.search(searchQuery).map(result => result.item);
      }

      if (location) {
          const fuse = new Fuse(competitions, {
              keys: ['location'],
              includeScore: true,
              threshold: 0.3,
          });
          competitions = fuse.search(location).map(result => result.item);
      }

      const data = count ? competitions.slice(0, count) : competitions.slice(0, pageLimit);

      return { 
        data, 
        totalCount: competitions.length, 
        lastDoc: null 
      };
    }

    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const fetchLimit = count || pageLimit;
    constraints.push(limit(fetchLimit));

    const q = query(competitionsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    let competitions = mapSnapshotToCompetitions(querySnapshot);

    if (excludeId) {
      competitions = competitions.filter(comp => comp.id !== excludeId);
    }

    return { 
      data: competitions, 
      totalCount: undefined, 
      lastDoc: lastVisible 
    };

  } catch (error) {
    console.error("Error fetching competitions: ", error);
    return { data: [], totalCount: 0, lastDoc: null };
  }
}

export async function getCompetitionById(id: string): Promise<Competition | null> {
  return withRetry(async () => {
    const docRef = doc(db, 'competitions', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      return { 
          id: docSnap.id, 
          ...data,
          postedAt: formatTimeAgo(data.createdAt),
          createdAtISO: createdAtDate.toISOString(),
     } as Competition;
    } else {
      console.log("No such competition document!");
      return null;
    }
  });
}

export async function updateCompetition(id: string, competitionData: Partial<Competition>): Promise<void> {
    try {
        const competitionRef = doc(db, 'competitions', id);
        const dataToUpdate: { [key: string]: any } = {
            ...competitionData,
            updatedAt: serverTimestamp()
        };
        
        Object.keys(dataToUpdate).forEach(key => {
            if (dataToUpdate[key] === undefined) {
                 delete dataToUpdate[key];
            }
        });
        
        if (dataToUpdate.positionsAvailable === undefined) {
            dataToUpdate.positionsAvailable = null;
        }

        await updateDoc(competitionRef, dataToUpdate);

    } catch (e) {
        console.error("Error updating competition: ", e);
        throw new Error("Failed to update competition");
    }
}

export async function deleteCompetition(competitionId: string): Promise<void> {
  try {
    const compRef = doc(db, 'competitions', competitionId);
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      transaction.delete(compRef);
      transaction.update(statsRef, { competitions: increment(-1) });
    });
  } catch (e) {
    console.error("Error deleting competition: ", e);
    throw new Error("Failed to delete competition");
  }
}

export async function getImmigrationPosts(
  options: {
    count?: number;
    searchQuery?: string;
    excludeId?: string;
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<ImmigrationPost>> {
  try {
    const { count, searchQuery, excludeId, lastDoc, limit: pageLimit = 16 } = options;
    const postsRef = collection(db, 'immigration');

    if (searchQuery) {
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      let posts = mapSnapshotToImmigrationPosts(querySnapshot);

      if (excludeId) {
        posts = posts.filter(post => post.id !== excludeId);
      }

      const fuse = new Fuse(posts, {
        keys: ['title', 'targetCountry', 'city', 'description', 'targetAudience', 'programType'],
        includeScore: true,
        threshold: 0.4,
      });
      posts = fuse.search(searchQuery).map(result => result.item);

      const data = count ? posts.slice(0, count) : posts.slice(0, pageLimit);

      return { 
        data, 
        totalCount: posts.length, 
        lastDoc: null 
      };
    }

    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const fetchLimit = count || pageLimit;
    constraints.push(limit(fetchLimit));

    const q = query(postsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    let posts = mapSnapshotToImmigrationPosts(querySnapshot);

    if (excludeId) {
      posts = posts.filter(post => post.id !== excludeId);
    }

    return { 
      data: posts, 
      totalCount: undefined, 
      lastDoc: lastVisible 
    };

  } catch (error) {
    console.error("Error fetching immigration posts: ", error);
    return { data: [], totalCount: 0, lastDoc: null };
  }
}

export async function getImmigrationPostBySlug(slug: string): Promise<ImmigrationPost | null> {
    try {
        const q = query(collection(db, "immigration"), where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        const programDetails = getProgramTypeDetails(data.programType);
        return {
            id: docSnap.id,
            ...data,
            iconName: programDetails.icon,
            postedAt: formatTimeAgo(data.createdAt)
        } as ImmigrationPost;
    } catch (error) {
        console.error("Error fetching immigration post by slug:", error);
        return null;
    }
}

export async function getImmigrationPostById(id: string): Promise<ImmigrationPost | null> {
  return withRetry(async () => {
    const docRef = doc(db, 'immigration', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const programDetails = getProgramTypeDetails(data.programType);
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      return { 
          id: docSnap.id, 
          ...data,
          iconName: programDetails.icon,
          postedAt: formatTimeAgo(data.createdAt),
          createdAtISO: createdAtDate.toISOString(),
     } as ImmigrationPost;
    } else {
      return null;
    }
  });
}

export async function postImmigration(postData: Omit<ImmigrationPost, 'id' | 'createdAt' | 'postedAt' | 'isNew' | 'iconName'>): Promise<{ id: string }> {
  try {
    const newPost: { [key: string]: any } = {
      ...postData,
      createdAt: serverTimestamp(),
    };

    Object.keys(newPost).forEach(key => {
      if (newPost[key] === undefined || newPost[key] === '') {
        delete newPost[key];
      }
    });

    const newDocRef = doc(collection(db, 'immigration'));
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      transaction.set(newDocRef, newPost);
      transaction.update(statsRef, { immigration: increment(1) });
    });
    return { id: newDocRef.id };
  } catch (e) {
    console.error("Error adding immigration post: ", e);
    throw new Error("Failed to post immigration ad");
  }
}

export async function updateImmigrationPost(id: string, postData: Partial<ImmigrationPost>): Promise<void> {
    try {
        const postRef = doc(db, 'immigration', id);
        const dataToUpdate: { [key: string]: any } = {
            ...postData,
            updatedAt: serverTimestamp()
        };
        
        Object.keys(dataToUpdate).forEach(key => {
            if (dataToUpdate[key] === undefined) {
                 delete dataToUpdate[key];
            }
        });
        
        await updateDoc(postRef, dataToUpdate);

    } catch (e) {
        console.error("Error updating immigration post: ", e);
        throw new Error("Failed to update immigration post");
    }
}

export async function deleteImmigrationPost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, 'immigration', postId);
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(postRef);
      if (!snap.exists()) throw "Document does not exist!";

      transaction.delete(postRef);
      transaction.update(statsRef, { immigration: increment(-1) });
    });
  } catch (e) {
    console.error("Error deleting immigration post: ", e);
    throw new Error("Failed to delete immigration post");
  }
}

export function getCategories() {
  return categories;
}

export function getCategoryById(id: string) {
    return categories.find((cat) => cat.id === id);
}

export function getOrganizers() {
  return organizers;
}

export function getOrganizerByName(organizerName?: string): Organizer | undefined {
    if (!organizerName) return undefined;
    return organizers.find(o => o.name === organizerName);
}

// --- Articles Functions ---
export async function getArticles(
  options: {
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<Article>> {
  try {
    const { limit: pageLimit = 8, lastDoc } = options;
    const articlesRef = collection(db, 'articles');
    
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageLimit));

    const q = query(articlesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const data = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAtDate = data.createdAt?.toDate 
        ? data.createdAt.toDate() 
        : (data.date ? new Date(data.date) : new Date());

      return {
        id: doc.id,
        ...data,
        postedAt: formatTimeAgo(data.createdAt),
        createdAtISO: createdAtDate.toISOString(),
      } as Article;
    });

    return { data, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error fetching articles: ", error);
    return { data: [], lastDoc: null };
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return withRetry(async () => {
    const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      postedAt: formatTimeAgo(data.createdAt),
    } as Article;
  });
}

export async function getArticleById(articleId: string): Promise<Article | null> {
  return withRetry(async () => {
    const docRef = doc(db, 'articles', articleId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
          id: docSnap.id, 
          ...data,
          postedAt: formatTimeAgo(data.createdAt),
     } as Article;
    } else {
      console.log("No such article document!");
      return null;
    }
  });
}

export async function addArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'postedAt' | 'date'>): Promise<{ id: string }> {
    try {
        const docRef = await addDoc(collection(db, 'articles'), {
            ...articleData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id };
    } catch (e) {
        console.error("Error adding article: ", e);
        throw new Error("Failed to add article");
    }
}

export async function updateArticle(articleId: string, articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'postedAt' | 'date'>>): Promise<void> {
    try {
        const dataToUpdate: { [key: string]: any } = {
            ...articleData,
            updatedAt: serverTimestamp()
        };
        
        Object.keys(dataToUpdate).forEach(key => {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key];
            }
        });

        await updateDoc(doc(db, 'articles', articleId), dataToUpdate);

    } catch (e) {
        console.error("Error updating article: ", e);
        throw new Error("Failed to update article");
    }
}

export async function deleteArticle(articleId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'articles', articleId));
    } catch (e) {
        console.error("Error deleting article: ", e);
        throw new Error("Failed to delete article");
    }
}

// --- Admin Functions ---
export async function getAllUsers(
  options: {
    limit?: number;
    lastDoc?: FirestoreCursor;
  } = {}
): Promise<PaginatedResponse<User>> {
  try {
    const { limit: pageLimit = 20, lastDoc } = options;
    const usersRef = collection(db, 'users');
    
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageLimit));

    const q = query(usersRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as User));

    return { data, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error fetching all users: ", error);
    return { data: [], lastDoc: null };
  }
}

export async function createUserDocument(userId: string, userData: any): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      transaction.set(userRef, userData);
      transaction.update(statsRef, { users: increment(1) });
    });
  } catch(e) {
    console.error("Error creating user document: ", e);
    throw new Error("Failed to create user document");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const statsRef = doc(db, 'stats', 'general');

    await runTransaction(db, async (transaction) => {
      transaction.delete(userRef);
      transaction.update(statsRef, { users: increment(-1) });
    });
  } catch (e) {
    console.error("Error deleting user document: ", e);
    throw new Error("Failed to delete user document");
  }
}

// --- Saved Ads Functions ---
export async function getSavedAdIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const savedAdsRef = collection(db, 'users', userId, 'savedAds');
    const snapshot = await getDocs(savedAdsRef);
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error fetching saved ad IDs: ", error);
    return [];
  }
}

export async function getSavedAds(userId: string): Promise<(Job | Competition | ImmigrationPost)[]> {
  if (!userId) return [];

  try {
    const savedAdsRef = collection(db, 'users', userId, 'savedAds');
    const snapshot = await getDocs(savedAdsRef);
    
    if (snapshot.empty) return [];

    const jobIds: string[] = [];
    const competitionIds: string[] = [];
    const immigrationIds: string[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const type = data.type || 'job';
      
      if (type === 'job') jobIds.push(doc.id);
      else if (type === 'competition') competitionIds.push(doc.id);
      else if (type === 'immigration') immigrationIds.push(doc.id);
    });

    const results: (Job | Competition | ImmigrationPost)[] = [];

    const fetchBatch = async (collectionName: string, ids: string[], mapper: (doc: any) => any) => {
      if (ids.length === 0) return;
      
      const chunks = chunkArray(ids, 30);
      
      const promises = chunks.map(chunk => {
        const q = query(collection(db, collectionName), where(documentId(), 'in', chunk));
        return getDocs(q);
      });

      const snapshots = await Promise.all(promises);
      
      snapshots.forEach(snap => {
        snap.docs.forEach(doc => {
          results.push(mapper(doc));
        });
      });
    };

    const jobMapper = (doc: any) => ({
      id: doc.id,
      ...doc.data(),
      postedAt: formatTimeAgo(doc.data().createdAt),
    } as Job);

    const compMapper = (doc: any) => ({
      id: doc.id,
      ...doc.data(),
      postedAt: formatTimeAgo(doc.data().createdAt),
    } as Competition);

    const immMapper = (doc: any) => {
      const data = doc.data();
      const programDetails = getProgramTypeDetails(data.programType);
      return {
        id: doc.id,
        ...data,
        iconName: programDetails.icon,
        postedAt: formatTimeAgo(data.createdAt),
      } as ImmigrationPost;
    };

    await Promise.all([
      fetchBatch('ads', jobIds, jobMapper),
      fetchBatch('competitions', competitionIds, compMapper),
      fetchBatch('immigration', immigrationIds, immMapper)
    ]);

    results.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return results;
  } catch (error) {
    console.error("Error fetching saved ads details: ", error);
    return [];
  }
}

export async function toggleSaveAd(userId: string, adId: string, adType: 'job' | 'competition' | 'immigration') {
    if (!userId || !adId) {
        throw new Error("User ID and Ad ID are required.");
    }

    const savedAdRef = doc(db, 'users', userId, 'savedAds', adId);
    
    try {
        const docSnap = await getDoc(savedAdRef);
        if (docSnap.exists()) {
            await deleteDoc(savedAdRef);
            return false; // Ad was unsaved
        } else {
            await setDoc(savedAdRef, {
                savedAt: serverTimestamp(),
                type: adType,
            });
            return true; // Ad was saved
        }
    } catch (error) {
        console.error("Error toggling saved ad status: ", error);
        throw new Error("Failed to update saved status.");
    }
}

// --- Reports and Contacts Functions ---
export async function addReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'reports'), {
      ...reportData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding report: ", e);
    throw new Error("Failed to add report");
  }
}

export async function getReports(): Promise<Report[]> {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reports', reportId));
  } catch (e) {
    console.error("Error deleting report: ", e);
    throw new Error("Failed to delete report");
  }
}

export async function addContactMessage(messageData: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<void> {
  try {
    await addDoc(collection(db, 'contacts'), {
      ...messageData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding contact message: ", e);
    throw new Error("Failed to add contact message");
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
}

export async function deleteContactMessage(messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contacts', messageId));
  } catch(e) {
    console.error("Error deleting contact message: ", e);
    throw new Error("Failed to delete contact message");
  }
}

export async function getGlobalStats() {
  try {
    const docRef = doc(db, 'stats', 'general');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as {
        jobs: number;
        seekers: number;
        competitions: number;
        immigration: number;
        users: number;
      };
    }
    return { jobs: 0, seekers: 0, competitions: 0, immigration: 0, users: 0 };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { jobs: 0, seekers: 0, competitions: 0, immigration: 0, users: 0 };
  }
}

export const getCachedInitialJobs = unstable_cache(
  async () => {
    const { data } = await getJobOffers({ limit: 16 });
    return data;
  },
  ['initial-jobs-list'],
  { tags: ['jobs-list', 'jobs-home'], revalidate: 3600 }
);

export const getCachedInitialImmigrationPosts = unstable_cache(
  async () => {
    const { data } = await getImmigrationPosts({ limit: 16 });
    return data;
  },
  ['initial-immigration-list'],
  { tags: ['immigration-list', 'immigration-home'], revalidate: 3600 }
);

export const getCachedInitialCompetitions = unstable_cache(
  async () => {
    const { data } = await getCompetitions({ limit: 16 });
    return data;
  },
  ['initial-competitions-list'],
  { tags: ['competitions-list', 'competitions-home'], revalidate: 3600 }
);

export const getCachedInitialJobSeekers = unstable_cache(
  async () => {
    const { data } = await getJobSeekers({ limit: 16 });
    return data;
  },
  ['initial-seekers-list'],
  { tags: ['seekers-list', 'seekers-home'], revalidate: 3600 }
);

export const getCachedInitialTestimonials = unstable_cache(
  async () => {
    const { data } = await getTestimonials({ limit: 8 });
    return data;
  },
  ['initial-testimonials-list'],
  { tags: ['testimonials-list', 'testimonials-home', 'testimonials'], revalidate: 3600 }
);

export const getCachedInitialArticles = unstable_cache(
  async () => {
    const { data } = await getArticles({ limit: 8 });
    return data;
  },
  ['initial-articles-list'],
  { tags: ['articles-list', 'articles-home', 'articles'], revalidate: 3600 }
);

export const getCachedGlobalStats = unstable_cache(
  async () => getGlobalStats(),
  ['global-stats'],
  { tags: ['stats'], revalidate: 3600 }
);

export const getCachedHomePageJobs = unstable_cache(
  async (isMobile: boolean) => {
    const count = isMobile ? 4 : 8;
    return getJobOffers({ count });
  },
  ['home-jobs'], 
  { tags: ['jobs-home'], revalidate: 3600 }
);

export const getCachedHomePageCompetitions = unstable_cache(
  async (isMobile: boolean) => {
    const count = isMobile ? 2 : 4;
    return getCompetitions({ count });
  },
  ['home-competitions'],
  { tags: ['competitions-home'], revalidate: 3600 }
);

export const getCachedHomePageImmigration = unstable_cache(
  async (isMobile: boolean) => {
    const count = isMobile ? 4 : 8;
    return getImmigrationPosts({ count });
  },
  ['home-immigration'],
  { tags: ['immigration-home'], revalidate: 3600 }
);

export const getCachedHomePageSeekers = unstable_cache(
  async (isMobile: boolean) => {
    const count = isMobile ? 2 : 4;
    return getJobSeekers({ count });
  },
  ['home-seekers'],
  { tags: ['seekers-home'], revalidate: 3600 }
);

export const getCachedHomePageTestimonials = unstable_cache(
  async (isMobile: boolean) => {
    const count = isMobile ? 1 : 4;
    return getTestimonials({ limit: count });
  },
  ['home-testimonials'], 
  { tags: ['testimonials'], revalidate: 3600 }
);

export const getCachedJobById = (id: string) => unstable_cache(
  async () => getJobById(id),
  [`job-${id}`],
  { tags: [`job-${id}`], revalidate: 3600 }
)();

export const getCachedCompetitionById = (id: string) => unstable_cache(
  async () => getCompetitionById(id),
  [`comp-${id}`],
  { tags: [`comp-${id}`], revalidate: 3600 }
)();

export const getCachedImmigrationById = (id: string) => unstable_cache(
  async () => getImmigrationPostById(id),
  [`imm-${id}`],
  { tags: [`imm-${id}`], revalidate: 3600 }
)();

export const getCachedArticleBySlug = (slug: string) => unstable_cache(
  async () => getArticleBySlug(slug),
  [`article-${slug}`],
  { tags: [`article-${slug}`], revalidate: 3600 }
)();

// Duplicated functions for new page content structure
// These will replace the older getAds function eventually.
export { getJobOffers, getJobSeekers };
