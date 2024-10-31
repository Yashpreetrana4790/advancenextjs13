"use client"
import Link from 'next/link'
import React, { useEffect } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons';
import GlobalFilters from './GlobalFilters';
import { globalSearch } from '@/lib/actions/general.action';
import { useSearchParams } from 'next/navigation';
import { Tag } from 'lucide-react';

const GlobalResult = () => {


  const global = useSearchParams().get('global');
  const type = useSearchParams().get('type');


  const [result, setResult] = React.useState([] as any);
  const [isLoading, setIsLoading] = React.useState(true)
  useEffect(() => {
    const fetchResult = async () => {
      setResult([]);
      setIsLoading(true);

      try {
        const res = await globalSearch({ query: global, type });
        setResult(JSON.parse(res));
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }

    if (global) {
      fetchResult();
    }
  }, [global, type]);

  const renderLink = (type: string, id: string) => {
    switch (type) {
      case 'question':
        return `/question/${id}`

      case 'answer':
        return `/answer/${id}`

      case 'user':
        return `/profile/${id}`

      case 'tag':
        return `/tag/${id}`


      default:
        return '/';
    }
  }




  return (
    <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-light-800 py-5 shadow-sm dark:bg-dark-400">
      <GlobalFilters />
      <div className="my-5 h-[1px] bg-light-700/50 dark:bg-dark-500/50" />

      <div className="space-y-5">
        <p className="text-dark400_light900 paragraph-semibold px-5">
          Top Match
        </p>

        {isLoading ? (
          <div className="flex-center flex-col px-5">
            <ReloadIcon className="my-2 h-10 w-10 animate-spin text-primary-500" />
            <p className="text-dark200_light800 body-regular">Browsing the entire database</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {result.length > 0 ? (
              result.map((item: any, index: number) => (
                <Link
                  href={renderLink(item.type, item.id)}
                  key={item.type + item.id + index}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-2.5 hover:bg-light-700/50 dark:bg-dark-500/50"
                >
                  <Tag className="text-primary-500" />

                  <div className='flex flex-col'>
                    <p className="body-medium text-dark200_light800 line-clamp-1">{item.title}</p>
                    <p className="text-light400_light500 small-medium mt-1 font-bold capitalize">{item.type}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex-center flex-col px-5">
                <p className="text-dark200_light800 body-regular px-5 py-2.5">Oops, no results found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalResult