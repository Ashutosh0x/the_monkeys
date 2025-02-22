'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

import { EditorProps } from '@/components/editor';
import Icon from '@/components/icon';
import Container from '@/components/layout/Container';
import { Loader } from '@/components/loader';
import PublishModal from '@/components/modals/publish/PublishModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import useGetDraftBlogDetail from '@/hooks/useGetDraftBlogDetail';
import useGetPublishedBlogDetailByBlogId from '@/hooks/useGetPublishedBlogDetailByBlogId';
import axiosInstance from '@/services/api/axiosInstance';
import { OutputData } from '@editorjs/editorjs';
import { useSession } from 'next-auth/react';

// Dynamically import the Editor component to avoid server-side rendering issues
const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
});

const initial_data = {
  time: new Date().getTime(),
  blocks: [],
};

export default function Page({ params }: { params: { blogId: string } }) {
  const [editor, setEditor] = useState<React.FC<EditorProps> | null>(null);
  const [data, setData] = useState<OutputData | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = params.blogId;
  const source = searchParams.get('source');

  // if user comes from draft blog card this api should get use
  const { blog, isLoading, mutate } = useGetDraftBlogDetail(blogId);

  // if user comes from published blog card this api should get use
  const { blog: publishedBlogDetail, isLoading: publishedBlogLoading } =
    useGetPublishedBlogDetailByBlogId(blogId);
  const authToken = session?.user.token;

  // Function to create and manage WebSocket connection
  const createWebSocket = useCallback((blogId: string, token: string) => {
    const ws = new WebSocket(
      `wss://dev.themonkeys.site/api/v1/blog/draft/${blogId}?token=${token}`
    );

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      setIsSaving(false); // Reset saving status when message is received
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWebSocket(ws);

    // Cleanup function to close the WebSocket connection
    return () => {
      ws.close();
    };
  }, []);

  // Function to format data before sending it to the server
  const formatData = useCallback(
    (data: OutputData, accountId: string | undefined) => {
      return {
        owner_account_id: accountId,
        author_list: [accountId],
        content_type: 'editorjs',
        blog: {
          time: data.time,
          blocks: data.blocks.map((block) => ({
            ...block,
            author: [accountId],
            time: new Date().getTime(),
          })),
        },
        tags: selectedTags,
      };
    },
    [selectedTags]
  );

  // Load the Editor component dynamically
  useEffect(() => {
    const loadEditor = async () => {
      const module = await import('@/components/editor');
      setEditor(() => module.default);
    };

    loadEditor();
  }, []);

  // Fetch draft blog data every time the page loads
  useEffect(() => {
    if (source === 'draft') {
      mutate();
    }
  }, [mutate, source]);

  // Create WebSocket connection when authToken is available
  useEffect(() => {
    if (session?.user.token) {
      const cleanup = createWebSocket(blogId, session.user.token);

      // Listen for beforeunload event to close the WebSocket connection
      const handleBeforeUnload = () => {
        cleanup();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        cleanup();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [session?.user.token, blogId, createWebSocket]);

  // Set editor data based on the source
  useEffect(() => {
    if (source === 'draft' && blog) {
      setData(blog.blog); // Set the editor data with the fetched draft blog data
    } else if (source === 'published' && publishedBlogDetail) {
      setData(publishedBlogDetail.blog); // Set the editor data with the fetched published blog data
    }
  }, [blog, publishedBlogDetail, source]);

  // Send data to WebSocket when data changes
  useEffect(() => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN && data) {
      const formattedData = formatData(data, session?.user.account_id);
      webSocket.send(JSON.stringify(formattedData));
      setIsSaving(true); // Set saving status when data is sent
    }
  }, [data, webSocket, session?.user.account_id, formatData]);

  // Handle the publish action
  const handlePublishStep = useCallback(() => {
    if (!data || data.blocks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Blog content cannot be empty.',
      });
      return; // Ensure data is not null and not empty
    }

    const formattedData = formatData(data, session?.user.account_id);
    axiosInstance
      .post(`/blog/publish/${blogId}`, formattedData)
      .then((res) => {
        console.log(res);
        toast({
          variant: 'success',
          title: 'Blog Published successfully',
          description: 'success',
        });
        router.push(`/${session?.user?.username}`);
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: 'destructive',
          title: 'Error publishing blog',
          description: 'error',
        });
      });
  }, [data, session?.user.account_id, blogId, formatData, router]);

  return (
    <Container className='min-h-screen px-5 py-4 pb-12'>
      {isLoading || publishedBlogLoading ? (
        <Loader className='mx-auto' />
      ) : (
        <div className='space-y-2'>
          <div className='mx-auto w-full sm:w-4/5 flex justify-between items-end'>
            {isSaving ? (
              <p className='font-josefin_Sans text-sm sm:text-base opacity-75'>
                Saving ...
              </p>
            ) : (
              <p className='font-josefin_Sans text-sm sm:text-base opacity-75'>
                Saved
              </p>
            )}

            <Button
              variant='secondary'
              onClick={() => setShowModal(true)}
              className='hidden sm:inline-flex'
            >
              Publish
            </Button>

            <Button
              variant='secondary'
              size='icon'
              onClick={() => setShowModal(true)}
              className='show sm:hidden rounded-full'
            >
              <Icon name='RiArrowRight' />
            </Button>
          </div>

          <Suspense fallback={<Loader />}>
            {editor && data && <Editor data={data} onChange={setData} />}
          </Suspense>
          {showModal && (
            <PublishModal
              setModal={setShowModal}
              setSelectedTags={setSelectedTags}
              blogId={blogId}
              handlePublishStep={handlePublishStep}
              publishedBlogLoading={publishedBlogLoading}
            />
          )}
        </div>
      )}
    </Container>
  );
}
