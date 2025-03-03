// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import Link from 'next/link'

import { Button } from '@dao-dao/stateless'

function Paginator({
  page,
  limit,
  count,
}: {
  page: number
  limit: number
  count: number
}) {
  const total = Math.ceil(count / limit)

  return (
    <div className="flex items-center gap-2">
      {Array.from(Array(total), (_, i) => (
        <Link key={i + 1} href={`?page=${i + 1}&limit=${limit}`} passHref>
          <Button className={`${page - 1 === i ? 'ring' : ''}`} size="sm">
            {i + 1}
          </Button>
        </Link>
      ))}
    </div>
  )
}

export default Paginator
