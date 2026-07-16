"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plane } from "lucide-react";
import { getImmigrationPosts, deleteImmigrationPost } from "@/lib/data";
import type { ImmigrationPost, FirestoreCursor } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DesktopPageHeader } from "@/components/layout/desktop-page-header";
import { revalidateAll } from "@/lib/revalidate";
import { ImmigrationGrid, LoadMoreButton } from "@/components/admin/admin-ads-grids";

const ITEMS_PER_PAGE = 16;

export default function AdminManageImmigrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { userData, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<ImmigrationPost[]>([]);
  const [cursor, setCursor] = useState<FirestoreCursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push("/");
    }
  }, [userData, authLoading, router]);

  const fetchPosts = useCallback(
    async (isLoadMore = false) => {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getImmigrationPosts({
          limit: ITEMS_PER_PAGE,
          lastDoc: isLoadMore ? cursor : null,
        });
        setPosts((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        setCursor(res.lastDoc);
        setHasMore(res.data.length === ITEMS_PER_PAGE);
      } catch (error) {
        toast({ variant: "destructive", title: "فشل تحميل فرص الهجرة" });
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [cursor, toast]
  );

  useEffect(() => {
    if (userData?.isAdmin) {
      fetchPosts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteImmigrationPost(postToDelete);
      await revalidateAll();
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
      toast({ title: "تم حذف الإعلان بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل حذف الإعلان" });
    } finally {
      setPostToDelete(null);
    }
  };

  if (authLoading || (loading && posts.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="إدارة فرص الهجرة">
        <Plane className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Plane}
        title="إدارة فرص الهجرة"
        description="مراجعة وتعديل وحذف إعلانات فرص الهجرة المنشورة في المنصة."
      />
      <div className="flex-grow container mx-auto max-w-7xl px-4 pb-12">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ImmigrationGrid posts={posts} onAdDelete={(id) => setPostToDelete(id)} />
            <LoadMoreButton
              onClick={() => fetchPosts(true)}
              loading={loadingMore}
              hasMore={hasMore}
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء سيقوم بحذف الإعلان بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
