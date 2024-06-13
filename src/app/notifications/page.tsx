import PageHeading from '@/components/pageHeading';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  return (
    <div className='pb-12'>
      <PageHeading heading='Notifications' />

      <Tabs defaultValue='all'>
        <div className='mt-6 flex flex-col justify-center items-center'>
          <TabsList className='font-josefin_Sans'>
            <TabsTrigger className='text-xl' value='all'>
              <p className='font-josefin_Sans text-base sm:text-xl'>All</p>

              <div className='h-[2px] w-1 bg-primary-monkeyOrange group-hover:w-full group-data-[state=active]:w-full transition-all rounded-full' />
            </TabsTrigger>

            <TabsTrigger className='text-xl' value='post'>
              <p className='font-josefin_Sans text-base sm:text-xl'>Post</p>

              <div className='h-[2px] w-1 bg-primary-monkeyOrange group-hover:w-full group-data-[state=active]:w-full transition-all rounded-full' />
            </TabsTrigger>

            <TabsTrigger className='text-xl' value='account'>
              <p className='font-josefin_Sans text-base sm:text-xl'>Account</p>

              <div className='h-[2px] w-1 bg-primary-monkeyOrange group-hover:w-full group-data-[state=active]:w-full transition-all rounded-full' />
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
